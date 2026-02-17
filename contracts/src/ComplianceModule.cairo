use starknet::ContractAddress;

#[starknet::interface]
trait IComplianceModule<TContractState> {
    fn grant_viewing_key(
        ref self: TContractState,
        auditor_address: ContractAddress,
        viewing_key: felt252,
        scope: ViewingScope
    );
    fn revoke_viewing_key(ref self: TContractState, auditor_address: ContractAddress);
    fn get_viewing_key(ref self: TContractState, auditor_address: ContractAddress) -> ViewingKeyData;
}

#[starknet::contract]
mod ComplianceModule {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::ContractState;
    use starknet::LegacyMap;
    use starknet::get_block_timestamp;

    #[storage]
    struct Storage {
        payroll_manager: ContractAddress,
        owner: ContractAddress,
        viewing_keys: LegacyMap<ContractAddress, ViewingKeyData>,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct ViewingKeyData {
        viewing_key: felt252,
        scope: ViewingScope,
        granted_at: u64,
        expires_at: u64,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct ViewingScope {
        time_range_start: u64,
        time_range_end: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ViewingKeyGranted: ViewingKeyGranted,
        ViewingKeyRevoked: ViewingKeyRevoked,
    }

    #[derive(Drop, starknet::Event)]
    struct ViewingKeyGranted {
        auditor: ContractAddress,
        viewing_key: felt252,
        time_range_start: u64,
        time_range_end: u64,
        granted_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct ViewingKeyRevoked {
        auditor: ContractAddress,
        revoked_at: u64,
    }

    #[constructor]
    fn constructor(ref self: ContractState, payroll_manager: ContractAddress, owner: ContractAddress) {
        self.payroll_manager.write(payroll_manager);
        self.owner.write(owner);
    }

    #[external(v0)]
    fn grant_viewing_key(
        ref self: ContractState,
        auditor_address: ContractAddress,
        viewing_key: felt252,
        scope: ViewingScope
    ) {
        assert(get_caller_address() == self.owner.read(), 'Not authorized');
        assert(scope.time_range_end > scope.time_range_start, 'Invalid time range');
        
        self.viewing_keys.write(auditor_address, ViewingKeyData {
            viewing_key,
            scope,
            granted_at: get_block_timestamp(),
            expires_at: scope.time_range_end,
        });
        
        self.emit(ViewingKeyGranted {
            auditor: auditor_address,
            viewing_key,
            time_range_start: scope.time_range_start,
            time_range_end: scope.time_range_end,
            granted_at: get_block_timestamp(),
        });
    }

    #[external(v0)]
    fn revoke_viewing_key(ref self: ContractState, auditor_address: ContractAddress) {
        assert(get_caller_address() == self.owner.read(), 'Not authorized');
        
        // Clear viewing key by writing zero values
        self.viewing_keys.write(auditor_address, ViewingKeyData {
            viewing_key: 0,
            scope: ViewingScope {
                time_range_start: 0,
                time_range_end: 0,
            },
            granted_at: 0,
            expires_at: 0,
        });
        
        self.emit(ViewingKeyRevoked {
            auditor: auditor_address,
            revoked_at: get_block_timestamp(),
        });
    }

    #[view]
    fn get_viewing_key(ref self: ContractState, auditor_address: ContractAddress) -> ViewingKeyData {
        self.viewing_keys.read(auditor_address)
    }
}
