use starknet::ContractAddress;
use starknet::get_caller_address;
use starknet::ContractState;
use starknet::Call;

#[starknet::interface]
trait IPayrollManagerClaim<TContractState> {
    fn get_employee(self: @TContractState, employee_address: ContractAddress) -> (felt252, felt252, felt252, bool, u64, u256);
}

#[starknet::interface]
trait IERC20<TContractState> {
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
}

#[starknet::interface]
trait IEmployeeAccount<TContractState> {
    fn claim_salary(ref self: TContractState);
    fn add_session_key(ref self: TContractState, session_key: felt252, expiry: u64);
    fn remove_session_key(ref self: TContractState, session_key: felt252);
    fn get_encrypted_balance(self: @TContractState) -> (felt252, felt252);
}

// Starknet VALIDATED constant for __validate__
const VALIDATED: felt252 = 'VALID';

#[starknet::contract]
mod EmployeeAccount {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use starknet::ContractState;
    use starknet::Call;
    use starknet::get_block_timestamp;
    use super::{IPayrollManagerClaimDispatcher, IPayrollManagerClaimDispatcherTrait};
    use super::VALIDATED;

    #[storage]
    struct Storage {
        owner: ContractAddress,
        payroll_manager: ContractAddress,
        encrypted_balance_c1: felt252,
        encrypted_balance_c2: felt252,
        session_keys: LegacyMap<felt252, u64>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        SalaryClaimed: SalaryClaimed,
        SessionKeyAdded: SessionKeyAdded,
        SessionKeyRemoved: SessionKeyRemoved,
    }

    #[derive(Drop, starknet::Event)]
    struct SalaryClaimed {
        employee: ContractAddress,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct SessionKeyAdded {
        session_key: felt252,
        expiry: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct SessionKeyRemoved {
        session_key: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, payroll_manager: ContractAddress) {
        self.owner.write(owner);
        self.payroll_manager.write(payroll_manager);
        self.encrypted_balance_c1.write(0);
        self.encrypted_balance_c2.write(0);
    }

    fn assert_owner_or_valid_session(ref self: ContractState) {
        let caller = get_caller_address();
        if caller == self.owner.read() {
            return;
        }
        // Check if caller has a valid session key (key = caller address as felt252)
        let expiry = self.session_keys.read(caller.into());
        assert(expiry > get_block_timestamp(), 'Not authorized');
    }

    #[abi(embed_v0)]
    impl EmployeeAccountImpl of super::IEmployeeAccount<ContractState> {
        fn claim_salary(ref self: ContractState) {
            self.assert_owner_or_valid_session();

            let manager_addr = self.payroll_manager.read();
            let manager = IPayrollManagerClaimDispatcher { contract_address: manager_addr };
            let this = get_contract_address();

            // Read employee data from payroll manager to verify active status
            let (_c1, _c2, _pk, active, _last_paid, _salary) = manager.get_employee(this);
            assert(active, 'Employee not active');

            self.emit(SalaryClaimed {
                employee: get_caller_address(),
                timestamp: get_block_timestamp(),
            });
        }

        fn add_session_key(ref self: ContractState, session_key: felt252, expiry: u64) {
            assert(get_caller_address() == self.owner.read(), 'Only owner');
            assert(get_block_timestamp() < expiry, 'Invalid expiry');

            self.session_keys.write(session_key, expiry);

            self.emit(SessionKeyAdded { session_key, expiry });
        }

        fn remove_session_key(ref self: ContractState, session_key: felt252) {
            assert(get_caller_address() == self.owner.read(), 'Only owner');
            self.session_keys.write(session_key, 0);

            self.emit(SessionKeyRemoved { session_key });
        }

        fn get_encrypted_balance(self: @ContractState) -> (felt252, felt252) {
            (self.encrypted_balance_c1.read(), self.encrypted_balance_c2.read())
        }
    }

    #[external(v0)]
    fn __validate__(ref self: ContractState, calls: Array<Call>) -> felt252 {
        let caller = get_caller_address();
        // Owner is always valid
        if caller == self.owner.read() {
            return VALIDATED;
        }
        // Check session key
        let expiry = self.session_keys.read(caller.into());
        assert(expiry > get_block_timestamp(), 'Invalid session');
        VALIDATED
    }

    #[external(v0)]
    fn __execute__(ref self: ContractState, calls: Array<Call>) -> Array<Span<felt252>> {
        self.assert_owner_or_valid_session();
        // Execute multicall
        let mut results: Array<Span<felt252>> = ArrayTrait::new();
        let mut i: u32 = 0;
        loop {
            if i >= calls.len() {
                break;
            }
            let call = calls.at(i);
            let result = starknet::call_contract_syscall(
                *call.to,
                *call.selector,
                call.calldata.span(),
            ).unwrap();
            results.append(result);
            i = i + 1;
        };
        results
    }
}
