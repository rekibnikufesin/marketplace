pragma solidity 0.4.24;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Marketplace {
    // Using Open-Zeppelin SafeMath to prevent Integer Overflow and Underflow
    using SafeMath for uint;
    address public owner;
    bool public online;
    uint public balance;

    // Admins
    struct Admin {
        bool enabled;
        string name;
    }

    mapping (address => Admin) public admins;

    // Store Owners
    struct StoreOwner {
        bool enabled;
        uint balance;
        uint[] storefronts;
    }

    mapping (address => StoreOwner) public storeOwners;

    // Store Fronts
    struct StoreFront {
        uint id;
        string name;
        string description;
        address storeFrontOwner;
        bool storeOnline;
        uint[] products;
    }

    uint public nextStoreFrontId;
    mapping (uint => StoreFront) public storeFronts;

    // Products
    struct Product {
        uint storeFrontId;
        address productOwner;
        string name;
        string description;
        uint inventory;
        uint price;
    }

    uint nextProductId;
    mapping (uint => Product) public products;

    constructor() public {
        owner = msg.sender;
        online = true;
        addAdmin(msg.sender); // make the owner an admin
        nextStoreFrontId = 0; // initially there are no store fronts
        nextProductId = 0; // set the first product id
    }

    modifier isOwner() {
        require(msg.sender == owner, "Only owner can execute this");
        _;
    }

    modifier isAdmin() {
        require(admins[msg.sender].enabled == true || msg.sender == owner, "Only admins can execute this");
        _;
    }

    modifier isOnline() {
        require(online, "Not allowed when marketplace is offline");
        _;
    }

    event AdminAdded(address newAdmin);
    function addAdmin(address newAdmin) public isAdmin isOnline {
        /**
         * @dev Adds an administrator to the Admin struct
         * @param newAdmin Ethereum address of the Admin to be added
         */
        Admin storage newAdmin_ = admins[newAdmin];
        newAdmin_.enabled = true;
        emit AdminAdded(newAdmin);
    }

    event AdminDisabled(address admin);
    function disableAdmin(address admin) public isAdmin {
        /**
         * @dev Disable an admin, preventing further access
         * @param admin Ethereum address of the Admin to disable
         */
        Admin storage disable = admins[admin];
        disable.enabled = false;
        emit AdminDisabled(admin);
    }

    event AdminWithdrewFunds(address admin, uint amount, uint balance);
    function withdrawMarketplaceFunds(uint amount) public isAdmin {
        /**
         * @dev Allows Admins to withdraw some or all of the funds earned
         * @param uint Amount to withdraw (in Wei)
         */
        require(balance >= amount, "Insufficient funds");
        balance = balance.sub(amount);
        msg.sender.transfer(amount);
        emit AdminWithdrewFunds(msg.sender, amount, balance);
    }

    event StoreOwnerAdded(address storeOwner);
    function addStoreOwner(address storeOwner) public isAdmin isOnline {
        /**
         * @dev Add a new Store Owner to the Marketplace
         * @param storeOwner Ethereum address of the new owner
         */
        StoreOwner storage newOwner = storeOwners[storeOwner];
        newOwner.enabled = true;
        emit StoreOwnerAdded(storeOwner);
    }

    event StoreOwnerDisabled(address storeOwner);
    function disableStoreOwner(address storeOwner) public isAdmin {
        /**
         * @dev Disable a Store Owner, preventing further access
         * @param storeOwner Ethereum address of the Store Owner to disable
         */
        StoreOwner storage disabledOwner = storeOwners[storeOwner];
        disabledOwner.enabled = false;
        emit StoreOwnerDisabled(storeOwner);
    }

    event ToggleMarketplace(bool status, address caller);
    function toggleOnline() public isAdmin {
        /**
         * @dev Toggle the status of the Marketplace: online or offline
         */
        online = !online;
        emit ToggleMarketplace(online, msg.sender);
    }

    function isStoreOwner(address storeOwner) public view returns (bool) {
        /**
         * @dev Returns true/false to indicate if address is a store owner
         * @param storeOwner Ethereum address to be verified
         */
        StoreOwner storage storeOwner_ = storeOwners[storeOwner];
        return storeOwner_.enabled;
    }

    event StoreOwnerWithdraw(address storeOwner);
    function storeOwnerWithdraw() public {
        /**
         * @dev Allows Store Owner to withdraw earned funds
         */
        require(isStoreOwner(msg.sender) == true, "Only store owner can call function");
        StoreOwner storage storeowner = storeOwners[msg.sender];
        uint balanceToTransfer = storeowner.balance;
        storeowner.balance = 0;
        msg.sender.transfer(balanceToTransfer);
        emit StoreOwnerWithdraw(msg.sender);
    }

    event NewStoreFrontId(uint id);
    function addStoreFront(string name, string description) public isOnline {
        /**
         * @dev Add a new store front for a store owner
         * @param name Name of the new store front
         * @param description Description for the new store front
         */
        require(isStoreOwner(msg.sender), "Only a store owner can create store fronts");
        StoreFront storage storeFront = storeFronts[nextStoreFrontId];
        storeFront.id = nextStoreFrontId;
        storeFront.name = name;
        storeFront.description = description;
        storeFront.storeFrontOwner = msg.sender;
        storeFront.storeOnline = true;
        StoreOwner storage storeFrontOwner = storeOwners[msg.sender];
        storeFrontOwner.storefronts.push(nextStoreFrontId);
        nextStoreFrontId ++;
        emit NewStoreFrontId(nextStoreFrontId);
    }

    function getStoresForOwner() public view isOnline returns (uint[]) {
        /**
         * @dev Get array of store front ids for a given owner
         * @return array of uints
         */
        require(isStoreOwner(msg.sender), "Only a store owner can access storefronts");
        StoreOwner storage storeFrontOwner = storeOwners[msg.sender];
        return storeFrontOwner.storefronts;
    }

    function getProductsForStore(uint storeId) public view isOnline returns (uint[]) {
        /**
         * @dev Get array of product ids for a given store
         * @param storeId the ID of the store to retrieve products
         * @return array of product ids
         */
        StoreFront storage storeFront = storeFronts[storeId];
        return storeFront.products;
    }

    event StoreFrontEdited(uint id);
    function editStoreFront(uint storeFront, string name, string description, bool storeOnline) public isOnline {
        /**
         * @dev Edit the name, description, online status of a given store front
         * @param storeFront ID of the store front to edit
         * @param name New name for the store front
         * @param description New description for the store front
         * @param storeOnline Set the status of the store: online or offline
         */
        StoreFront storage storeFront_ = storeFronts[storeFront];
        require(storeFront_.storeFrontOwner == msg.sender, "Only the owner can edit a Store Front");
        storeFront_.name = name;
        storeFront_.description = description;
        storeFront_.storeOnline = storeOnline;
        emit StoreFrontEdited(storeFront);
    }

    event ProductAdded(uint id);
    function addProduct(
        uint storeFrontId, string name, string description, uint inventory, uint price
        ) public isOnline {
        /**
         * @dev Add a new product for a store
         * @param storeFrontId store front id for the new product
         * @param name Name of the product
         * @param description Description of the product
         * @param inventory Quantity in inventory
         * @param price Price of the product (in Wei)
         */
        Product storage product_ = products[nextProductId];
        product_.storeFrontId = storeFrontId;
        product_.productOwner = msg.sender;
        product_.name = name;
        product_.description = description;
        product_.inventory = inventory;
        product_.price = price;
        StoreFront storage storeFront_ = storeFronts[storeFrontId];
        storeFront_.products.push(nextProductId);
        emit ProductAdded(nextProductId);
        nextProductId ++;
    }

    event ProductEdited(uint id);
    function editProduct(
        uint productId, string name, string description, uint inventory, uint price
    ) public isOnline {
        /**
         * @dev Edit a product
         * @param productId Product Id of the product to edit
         * @param name Name of the product
         * @param description Description of the product
         * @param inventory Quantity in inventory
         * @param price Price of the product (in Wei)
         */
        Product storage product_ = products[productId];
        require(product_.productOwner == msg.sender, "Only the store front owner can edit products");
        product_.name = name;
        product_.description = description;
        product_.inventory = inventory;
        product_.price = price;
        emit ProductEdited(productId);
    }

    event ProductBought(uint id, address storeowner, uint profit);
    function buyProduct(uint productId, uint quantity) public isOnline payable {
        /**
         * @dev Buy a product from the marketplace
         * @param productId ID of the product to buy
         * @param quantity Number of the products to buy
         */
        Product storage product = products[productId];
        require(msg.value == quantity.mul(product.price), "Insufficient funds attached for purchase");
        StoreOwner storage storeowner = storeOwners[product.productOwner];
        uint tenPercent = msg.value.div(10);
        storeowner.balance += tenPercent.mul(9); // transfer 90% of the sale to the store owner
        balance += tenPercent; // transfer 10% of the sale to the marketplace
        product.inventory = product.inventory.sub(quantity);
        emit ProductBought(productId, product.productOwner, tenPercent.mul(9));
    }

    event ForcedWithdrawExecuted(uint amount, address calledBy);
    function forcedWithdraw(uint amount) public isOwner {
        /**
         * @dev Allow the owner to withdraw any funds forcibly sent to the contract
         * @param amount The amount to withdraw (in Wei)
         */
        require(this.balance() > amount, "Insufficient funds");
        emit ForcedWithdrawExecuted(amount, msg.sender);
        msg.sender.transfer(amount);
    }
}
