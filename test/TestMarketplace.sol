pragma solidity 0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Marketplace.sol";

contract TestMarketplace {
    Marketplace marketplace;

    function beforeAll() public {
        marketplace = Marketplace(DeployedAddresses.Marketplace());
    }
}