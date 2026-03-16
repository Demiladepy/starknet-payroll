use starknet::ContractAddress;
use starknet::get_caller_address;
use starknet::get_block_timestamp;
use starknet::get_contract_address;
use starknet::ContractState;

#[starknet::interface]
trait IERC20<TContractState> {
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
}

#[starknet::interface]
trait ITongoWrapper<TContractState> {
    fn transfer_encrypted(
        ref self: TContractState,
        recipient: ContractAddress,
        encrypted_amount_c1: felt252,
        encrypted_amount_c2: felt252,
        public_key: felt252,
    );
}

#[starknet::interface]
trait IPayrollManager<TContractState> {
    fn add_employee(
        ref self: TContractState,
        employee_address: ContractAddress,
        encrypted_salary_c1: felt252,
        encrypted_salary_c2: felt252,
        public_key: felt252,
        salary_amount: u256,
    );
    fn execute_payroll(ref self: TContractState);
    fn update_salary(
        ref self: TContractState,
        employee_address: ContractAddress,
        encrypted_salary_c1: felt252,
        encrypted_salary_c2: felt252,
        salary_amount: u256,
    );
    fn remove_employee(ref self: TContractState, employee_address: ContractAddress);
    fn set_payment_schedule(ref self: TContractState, frequency: u64, next_payment: u64);
    fn get_employee(self: @TContractState, employee_address: ContractAddress) -> (felt252, felt252, felt252, bool, u64, u256);
    fn get_payment_schedule(self: @TContractState) -> (u64, u64);
    fn get_employee_count(self: @TContractState) -> u32;
}

#[starknet::contract]
mod PayrollManager {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::get_block_timestamp;
    use starknet::get_contract_address;
    use starknet::ContractState;
    use super::{IERC20Dispatcher, IERC20DispatcherTrait};
    use super::{ITongoWrapperDispatcher, ITongoWrapperDispatcherTrait};

    #[storage]
    struct Storage {
        owner: ContractAddress,
        usdc_token: ContractAddress,
        tongo_wrapper: ContractAddress,
        employees: LegacyMap<ContractAddress, EmployeeData>,
        employee_addresses: LegacyMap<u32, ContractAddress>,
        num_employees: u32,
        pay_schedule: PaymentSchedule,
        compliance_module: ContractAddress,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct EmployeeData {
        encrypted_salary_c1: felt252,
        encrypted_salary_c2: felt252,
        public_key: felt252,
        active: bool,
        last_paid: u64,
        salary_amount: u256,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct PaymentSchedule {
        frequency: u64,
        next_payment: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        EmployeeAdded: EmployeeAdded,
        PayrollExecuted: PayrollExecuted,
        SalaryPaid: SalaryPaid,
        EmployeeRemoved: EmployeeRemoved,
        SalaryUpdated: SalaryUpdated,
        PaymentFailed: PaymentFailed,
    }

    #[derive(Drop, starknet::Event)]
    struct EmployeeAdded {
        employee: ContractAddress,
        public_key: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct PayrollExecuted {
        timestamp: u64,
        employee_count: u32,
        total_paid: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct SalaryPaid {
        employee: ContractAddress,
        encrypted_c1: felt252,
        encrypted_c2: felt252,
        amount: u256,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct EmployeeRemoved {
        employee: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct SalaryUpdated {
        employee: ContractAddress,
        encrypted_c1: felt252,
        encrypted_c2: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct PaymentFailed {
        employee: ContractAddress,
        reason: felt252,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        usdc_token: ContractAddress,
        tongo_wrapper: ContractAddress,
        compliance_module: ContractAddress,
    ) {
        self.owner.write(owner);
        self.usdc_token.write(usdc_token);
        self.tongo_wrapper.write(tongo_wrapper);
        self.compliance_module.write(compliance_module);

        self.pay_schedule.write(PaymentSchedule {
            frequency: 2592000, // 30 days
            next_payment: 0,
        });
    }

    #[abi(embed_v0)]
    impl PayrollManagerImpl of super::IPayrollManager<ContractState> {
        fn add_employee(
            ref self: ContractState,
            employee_address: ContractAddress,
            encrypted_salary_c1: felt252,
            encrypted_salary_c2: felt252,
            public_key: felt252,
            salary_amount: u256,
        ) {
            assert(get_caller_address() == self.owner.read(), 'Not authorized');

            self.employees.write(employee_address, EmployeeData {
                encrypted_salary_c1,
                encrypted_salary_c2,
                public_key,
                active: true,
                last_paid: 0,
                salary_amount,
            });

            let count = self.num_employees.read();
            self.employee_addresses.write(count, employee_address);
            self.num_employees.write(count + 1);

            self.emit(EmployeeAdded { employee: employee_address, public_key });
        }

        fn execute_payroll(ref self: ContractState) {
            assert(get_caller_address() == self.owner.read(), 'Not authorized');

            let schedule = self.pay_schedule.read();
            assert(get_block_timestamp() >= schedule.next_payment, 'Too early');

            let contract_address = get_contract_address();
            let token = IERC20Dispatcher { contract_address: self.usdc_token.read() };
            let tongo = ITongoWrapperDispatcher { contract_address: self.tongo_wrapper.read() };

            // Check contract has enough balance before starting
            let balance = token.balance_of(contract_address);

            let n = self.num_employees.read();
            let mut total_needed: u256 = 0;
            let mut i: u32 = 0;
            loop {
                if i >= n {
                    break;
                }
                let emp_addr = self.employee_addresses.read(i);
                let data = self.employees.read(emp_addr);
                if data.active {
                    total_needed = total_needed + data.salary_amount;
                }
                i = i + 1;
            };
            assert(balance >= total_needed, 'Insufficient contract balance');

            // Approve tongo wrapper to spend tokens for encrypted transfers
            token.approve(self.tongo_wrapper.read(), total_needed);

            let mut paid_count: u32 = 0;
            let mut total_paid: u256 = 0;
            i = 0;
            loop {
                if i >= n {
                    break;
                }
                let employee_address = self.employee_addresses.read(i);
                let mut data = self.employees.read(employee_address);
                if data.active {
                    // Transfer via Tongo wrapper for privacy
                    tongo.transfer_encrypted(
                        employee_address,
                        data.encrypted_salary_c1,
                        data.encrypted_salary_c2,
                        data.public_key,
                    );

                    data.last_paid = get_block_timestamp();
                    self.employees.write(employee_address, data);

                    total_paid = total_paid + data.salary_amount;

                    self.emit(SalaryPaid {
                        employee: employee_address,
                        encrypted_c1: data.encrypted_salary_c1,
                        encrypted_c2: data.encrypted_salary_c2,
                        amount: data.salary_amount,
                        timestamp: get_block_timestamp(),
                    });
                    paid_count = paid_count + 1;
                }
                i = i + 1;
            };

            // Update schedule for next pay period
            let mut new_schedule = schedule;
            new_schedule.next_payment = get_block_timestamp() + schedule.frequency;
            self.pay_schedule.write(new_schedule);

            self.emit(PayrollExecuted {
                timestamp: get_block_timestamp(),
                employee_count: paid_count,
                total_paid,
            });
        }

        fn update_salary(
            ref self: ContractState,
            employee_address: ContractAddress,
            encrypted_salary_c1: felt252,
            encrypted_salary_c2: felt252,
            salary_amount: u256,
        ) {
            assert(get_caller_address() == self.owner.read(), 'Not authorized');

            let mut employee = self.employees.read(employee_address);
            assert(employee.active, 'Employee not active');

            employee.encrypted_salary_c1 = encrypted_salary_c1;
            employee.encrypted_salary_c2 = encrypted_salary_c2;
            employee.salary_amount = salary_amount;

            self.employees.write(employee_address, employee);

            self.emit(SalaryUpdated {
                employee: employee_address,
                encrypted_c1: encrypted_salary_c1,
                encrypted_c2: encrypted_salary_c2,
            });
        }

        fn remove_employee(ref self: ContractState, employee_address: ContractAddress) {
            assert(get_caller_address() == self.owner.read(), 'Not authorized');

            let mut employee = self.employees.read(employee_address);
            employee.active = false;
            self.employees.write(employee_address, employee);

            self.emit(EmployeeRemoved { employee: employee_address });
        }

        fn set_payment_schedule(ref self: ContractState, frequency: u64, next_payment: u64) {
            assert(get_caller_address() == self.owner.read(), 'Not authorized');

            self.pay_schedule.write(PaymentSchedule { frequency, next_payment });
        }

        fn get_employee(self: @ContractState, employee_address: ContractAddress) -> (felt252, felt252, felt252, bool, u64, u256) {
            let data = self.employees.read(employee_address);
            (data.encrypted_salary_c1, data.encrypted_salary_c2, data.public_key, data.active, data.last_paid, data.salary_amount)
        }

        fn get_payment_schedule(self: @ContractState) -> (u64, u64) {
            let s = self.pay_schedule.read();
            (s.frequency, s.next_payment)
        }

        fn get_employee_count(self: @ContractState) -> u32 {
            self.num_employees.read()
        }
    }
}
