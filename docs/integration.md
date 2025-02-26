# Integration Details

## Environment Setup
Run the following command to install dependencies:
```bash
npm install
```

## User Interaction
The User Interaction page allows users to stake, withdraw, exit, claim, and restake $BRAIDS tokens.

### Functions
- `stake(uint256 amount)`: Stakes the specified amount of tokens.
- `withdraw()`: Withdraws staked tokens.
- `exit()`: Exits from the staking contract.
- `getReward()`: Claims rewards.

## Admin Interaction
The Admin Interaction page allows admins to grant/revoke roles and deposit rewards.

### Functions
- `grantRole(bytes32 role, address account)`: Grants the specified role to an account.
- `revokeRole(bytes32 role, address account)`: Revokes the specified role from an account.
- `depositReward(uint256 amount)`: Deposits rewards into the contract.

## Data Structures
- **ABI**: The ABI provided should be used to interact with the smart contract.
- **Roles**:
  - `DEFAULT_ADMIN_ROLE`: Admin role.
  - `MAINTAINER_ROLE`: Maintainer role.
  - `REWARDS_DEPOSITOR_ROLE`: Depositor role.

## Testing
Ensure all functionalities work as expected on both User and Admin Interaction pages.