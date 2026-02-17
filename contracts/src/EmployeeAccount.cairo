use starknet::ContractAddress;
use starknet::get_caller_address;
use starknet::ContractState;
use starknet::Call;
use starknet::ArrayTrait;

#[starknet::interface]
trait IEmployeeAccount<TContractState> {
    fn claim_salary(ref self: TContractState);
    fn add_session_key(ref self: TContractState, session_key: felt252, expiry: u64);
    fn remove_session_key(ref self: TContractState, session_key: felt252);
    fn get_encrypted_balance(ref self: TContractState) -> (felt252, felt252);
}

#[starknet::contract]
mod EmployeeAccount {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::ContractState;
    use starknet::Call;
    use starknet::ArrayTrait;
    use starknet::LegacyMap;
    use starknet::get_block_timestamp;

    #[storage]
    struct Storage {
        payroll_manager: ContractAddress,
        encrypted_balance_c1: felt252,
        encrypted_balance_c2: felt252,
        session_keys: LegacyMap<felt252, u64>, // session_key -> expiry timestamp
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
    fn constructor(ref self: ContractState, payroll_manager: ContractAddress) {
        self.payroll_manager.write(payroll_manager);
        self.encrypted_balance_c1.write(0);
        self.encrypted_balance_c2.write(0);
    }

    #[external(v0)]
    fn claim_salary(ref self: ContractState) {
        // Employee can claim their salary
        // This would interact with PayrollManager to transfer encrypted amount
        self.emit(SalaryClaimed {
            employee: get_caller_address(),
            timestamp: get_block_timestamp(),
        });
    }

    #[external(v0)]
    fn add_session_key(ref self: ContractState, session_key: felt252, expiry: u64) {
        // Demo-friendly access control:
        // In a production account contract, session key management should be gated by signature
        // verification / owner checks. This demo allows the caller to add keys directly.
        assert(get_block_timestamp() < expiry, 'Invalid expiry');
        
        self.session_keys.write(session_key, expiry);
        
        self.emit(SessionKeyAdded { session_key, expiry });
    }

    #[external(v0)]
    fn remove_session_key(ref self: ContractState, session_key: felt252) {
        // Demo-friendly access control (see add_session_key).
        self.session_keys.write(session_key, 0);
        
        self.emit(SessionKeyRemoved { session_key });
    }

    #[view]
    fn get_encrypted_balance(ref self: ContractState) -> (felt252, felt252) {
        (self.encrypted_balance_c1.read(), self.encrypted_balance_c2.read())
    }

    // Account abstraction: __validate__ returns paymaster address
    #[external(v0)]
    fn __validate__(ref self: ContractState, calls: Array<Call>) -> felt252 {
        // Return payroll manager address as paymaster
        // This enables gasless transactions for employees
        self.payroll_manager.read().into()
    }
}
