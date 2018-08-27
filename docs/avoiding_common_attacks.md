## Common Attacks

### Reentrancy

To prevent reentrency attacks, require statements are used and place as early in the function as possible. All internal functions are completed prior to executing Ether transfers.

See:
- withdrawMarketplaceFunds (line 100)
- storeOwnerWithdraw (line 152)
- productBought (line 268)

### Cross-function Race Conditions

No cross-function race conditions were identified

### Transaction-Ordering Dependence (TOD) / Front Running

No time-sensitive or order-dependent transactions are present

### Integer Overflow and Underflow

Multiple conditions exist for this attack: withdrawing funds, tracking inventory.

To avoid this attack, the Open-Zeppelin SafeMath library was imported and used for all math operations.

### Underflow in Depth: Storage Manipulation

No areas identified

### DoS with (Unexpected revert)

This attack was avoided through the use of pull transfers vs. push payments

### DoS with Block Gas Limit

Gas limit block attacks were minimized through the implementation of getting individual struct items vs. returning arrays of tuples. The only exception to this might be by creating many store fronts, or many products in a single store. An array of uints is returned when called, but only the uint itself, not the details for the individual store front or products within. Those must be called individually.

### Forcibly Sending Ether to a Contract

In the event Ether is forcibly sent to a contract, the `forcedWithdraw` function can be used to withdraw the Ether. This function allows any amount (up to the amount held by the contract) to be withdrawn.