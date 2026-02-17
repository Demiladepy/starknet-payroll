use starknet::ContractAddress;
use starknet::get_caller_address;
use starknet::get_block_timestamp;
use starknet::get_contract_address;
use starknet::ContractState;
use starknet::ClassHash;
use starknet::deploy_syscall;
use starknet::SyscallResultTrait;
use starknet::get_block_number;

#[starknet::interface]
trait IPayrollManager<TContractState> {
    fn add_employee(
        ref self: TContractState,
        employee_address: ContractAddress,
        encrypted_salary_c1: felt252,
        encrypted_salary_c2: felt252,
        public_key: felt252
    );
    fn execute_payroll(ref self: ContractState);
    fn update_salary(
        ref self: TContractState,
        employee_address: ContractAddress,
        encrypted_salary_c1: felt252,
        encrypted_salary_c2: felt252
    );
    fn remove_employee(ref self: TContractState, employee_address: ContractAddress);
    fn set_payment_schedule(ref self: TContractState, frequency: u64, next_payment: u64);
    fn get_employee(ref self: TContractState, employee_address: ContractAddress) -> EmployeeData;
    fn get_payment_schedule(ref self: TContractState) -> PaymentSchedule;
}

#[starknet::contract]
mod PayrollManager {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::get_block_timestamp;
    use starknet::get_contract_address;
    use starknet::ContractState;
    use starknet::ClassHash;
    use starknet::deploy_syscall;
    use starknet::SyscallResultTrait;
    use starknet::get_block_number;
    use starknet::Call;
    use starknet::ArrayTrait;
    use starknet::array;
    use starknet::Into;
    use starknet::selector;

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
    }

    #[derive(Drop, starknet::Event)]
    struct SalaryPaid {
        employee: ContractAddress,
        encrypted_c1: felt252,
        encrypted_c2: felt252,
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
        
        // Default monthly payment schedule (30 days = 2592000 seconds)
        self.pay_schedule.write(PaymentSchedule {
            frequency: 2592000,
            next_payment: 0,
        });
    }

    #[external(v0)]
    fn add_employee(
        ref self: ContractState,
        employee_address: ContractAddress,
        encrypted_salary_c1: felt252,
        encrypted_salary_c2: felt252,
        public_key: felt252
    ) {
        assert(get_caller_address() == self.owner.read(), 'Not authorized');

        self.employees.write(employee_address, EmployeeData {
            encrypted_salary_c1,
            encrypted_salary_c2,
            public_key,
            active: true,
            last_paid: 0,
        });

        let count = self.num_employees.read();
        self.employee_addresses.write(count, employee_address);
        self.num_employees.write(count + 1);

        self.emit(EmployeeAdded { employee: employee_address, public_key });
    }

    #[external(v0)]
    fn execute_payroll(ref self: ContractState) {
        assert(get_caller_address() == self.owner.read(), 'Not authorized');
        
        let schedule = self.pay_schedule.read();
        assert(get_block_timestamp() >= schedule.next_payment, 'Too early');

        let n = self.num_employees.read();
        let mut paid_count: u32 = 0;
        let mut i: u32 = 0;
        loop {
            if i >= n {
                break;
            }
            let employee_address = self.employee_addresses.read(i);
            let mut data = self.employees.read(employee_address);
            if data.active {
                data.last_paid = get_block_timestamp();
                self.employees.write(employee_address, data);
                self.emit(SalaryPaid {
                    employee: employee_address,
                    encrypted_c1: data.encrypted_salary_c1,
                    encrypted_c2: data.encrypted_salary_c2,
                    timestamp: get_block_timestamp(),
                });
                paid_count = paid_count + 1;
            };
            i = i + 1;
        }
        
        let mut new_schedule = schedule;
        new_schedule.next_payment = get_block_timestamp() + schedule.frequency;
        self.pay_schedule.write(new_schedule);

        self.emit(PayrollExecuted {
            timestamp: get_block_timestamp(),
            employee_count: paid_count,
        });
    }

    #[external(v0)]
    fn update_salary(
        ref self: ContractState,
        employee_address: ContractAddress,
        encrypted_salary_c1: felt252,
        encrypted_salary_c2: felt252
    ) {
        assert(get_caller_address() == self.owner.read(), 'Not authorized');
        
        let mut employee = self.employees.read(employee_address);
        assert(employee.active, 'Employee not active');
        
        employee.encrypted_salary_c1 = encrypted_salary_c1;
        employee.encrypted_salary_c2 = encrypted_salary_c2;
        
        self.employees.write(employee_address, employee);
        
        self.emit(SalaryUpdated {
            employee: employee_address,
            encrypted_c1: encrypted_salary_c1,
            encrypted_c2: encrypted_salary_c2,
        });
    }

    #[external(v0)]
    fn remove_employee(ref self: ContractState, employee_address: ContractAddress) {
        assert(get_caller_address() == self.owner.read(), 'Not authorized');
        
        let mut employee = self.employees.read(employee_address);
        employee.active = false;
        self.employees.write(employee_address, employee);
        
        self.emit(EmployeeRemoved { employee: employee_address });
    }

    #[external(v0)]
    fn set_payment_schedule(ref self: ContractState, frequency: u64, next_payment: u64) {
        assert(get_caller_address() == self.owner.read(), 'Not authorized');
        
        self.pay_schedule.write(PaymentSchedule { frequency, next_payment });
    }

    #[view]
    fn get_employee(ref self: ContractState, employee_address: ContractAddress) -> EmployeeData {
        self.employees.read(employee_address)
    }

    #[view]
    fn get_payment_schedule(ref self: ContractState) -> PaymentSchedule {
        self.pay_schedule.read()
    }
}
