let Marketplace = artifacts.require('./Marketplace.sol')

contract('Marketplace', async (accounts) => {
    let marketplace
    const owner = accounts[0]
    const admin1 = accounts[1]
    const storeOwner1 = accounts[3]
    const storeOwner2 = accounts[4]
    const cust1 = accounts[6]

    before(async() => {
        marketplace = await Marketplace.deployed()
    })

    /**************************************************************************
     *                      Admin Functions
     **************************************************************************/

    it('Should have the owner as an admin', async() => {
        const admin = await marketplace.admins(owner)
        assert.isTrue(admin[0], 'Enabled should be true')
    })

    it('Should disable an admin', async() => {
        const newAdmin = await marketplace.addAdmin(admin1)
        const enabled = await marketplace.admins(admin1)
        assert.isTrue(enabled[0], 'The new admin was never added')
        const disabled = await marketplace.disableAdmin(admin1)
        const updatedAdmin = await marketplace.admins(admin1)
        assert.isFalse(updatedAdmin[0], 'The admin should be disabled')
    })

    it('Should fail if a non-admin adds an admin', async() => {
        try {
            const newAdmin = await marketplace.addAdmin(
                admin1,
                {from: storeOwner1}
            )
            throw('Operation should have failed')
        } catch(e) {
            assert.match(e, /VM Exception while processing transaction: revert/, 'A non-admin should not be able to add an admin')
        }
    })

    it('Should add a store owner', async() => {
        const newOwner = await marketplace.addStoreOwner(storeOwner1)
        const ownerEnabled = await marketplace.storeOwners(storeOwner1)
        assert.isTrue(ownerEnabled[0])
    })

    it('Should fail if a store owner tries to add a store owner', async() => {
        try {
            const newStoreOwner = await marketplace.addStoreOwner(
                storeOwner2,
                {from: storeOwner1}
            )
            throw('Operation should have failed')
        } catch(e) {
            assert.match(e, /VM Exception while processing transaction: revert/, 'A store owner should not be able to add a store owner')
        }
    })

    it('Should disable a StoreOwner account', async() => {
        const storeOwner = await marketplace.addStoreOwner(storeOwner1)
        let ownerStatus = await marketplace.storeOwners(storeOwner1)
        assert.isTrue(ownerStatus[0], 'The store owner was not initially enabled')
        const disableStoreOwner = await marketplace.disableStoreOwner(storeOwner1)
        ownerStatus = await marketplace.storeOwners(storeOwner1)
        assert.isFalse(ownerStatus[0], 'The store owner should be disabled')
    })

    it('Should only disable store owners when called by an admin', async() => {
        const storeOwner = await marketplace.addStoreOwner(storeOwner1)
        try {
            const disableStoreOwner = await marketplace.disableStoreOwner(
                storeOwner1,
                {from: storeOwner2}
            )
            throw('Operation should have failed')
        } catch(e) {
            assert.match(e, /VM Exception while processing transaction: revert/, 'A store owner should not be able to disable another store owner')
        }
    })

    it('Should be able to take the marketplace offline', async() => {
        const preStatus = await marketplace.online()
        const toggleStore = await marketplace.toggleOnline({from: owner})
        const postStatus = await marketplace.online()
        assert.isTrue(preStatus, 'The marketplace should have been online initiall')
        assert.isFalse(postStatus, 'The marketplace should be offline')
        const resumeMarketplace = await marketplace.toggleOnline({from: owner}) // Re-enable the marketplace or remaining tests will fail
    })

    it('Should only allow admins to take marketplace offline', async() => {
        try {
            const toggleStore = await marketplace.toggleOnline({from: storeOwner1})
            throw('Operation should have failed')
        } catch(e) {
            assert.match(e, /VM Exception while processing transaction: revert/, 'Only admins can toggle marketplace status')
        }
    })

    /**************************************************************************
    *                      Store Owner Functions
    **************************************************************************/

    it('Should recognize a store owner', async() => {
        const storeOwner = await marketplace.isStoreOwner(storeOwner1)
        assert.isTrue(storeOwner, 'The store owner should be recognized')
    })

    it('Should not recognize a non-store owner as a store owner', async() => {
        const storeOwner = await marketplace.isStoreOwner(cust1)
        assert.isFalse(storeOwner, 'The customer should not be recognized as a store owner')
    })

    it('Should create a Store Front for a Store Owner', async() => {
        const newStoreFront = await marketplace.addStoreFront(
            'Test Store',
            'Nothing to see here, just testing',
            {from: storeOwner1}
        )
        const returnedStoreFront = await marketplace.storeFronts(0);
        assert.equal(returnedStoreFront[1], 'Test Store', 'The test store should have a name')
        assert.equal(returnedStoreFront[2], 'Nothing to see here, just testing', 'The test store should have a description')
        assert.equal(returnedStoreFront[3], storeOwner1, 'The test store should belong to the store owner creating it')
        assert.equal(returnedStoreFront[4], true, 'The test store should be online')
    })

    it('Should only create store fronts for store owners', async() => {
        try {
            const newStoreFront = await marketplace.addStoreFront(
                'Invalid store',
                'Invalid store description',
                {from: cust1}
            )
            throw('Operation should have failed')
        } catch(e) {
            assert.match(e, /VM Exception while processing transaction: revert/, 'A customer should not be able to create a store front')
        }
    })

    it('Should return a list of store fronts to the store owner', async() => {
        const newOwner = await marketplace.addStoreOwner(storeOwner1)
        const newStoreFront = await marketplace.addStoreFront(
            'Store Owner 1 Store Front',
            'A generic store belonging to Store Owner 1',
            {from: storeOwner1}
        )
        const storeOwner = await marketplace.getStoresForOwner(
            {from: storeOwner1}
        )
        assert.equal(storeOwner[0], 0, 'The store owner should own store front 0')
        assert.equal(storeOwner[1], 1, 'The store owner should own store front 1')
    })

    it('Should edit the store front', async() => {
        let storeFront = await marketplace.storeFronts(0);
        assert.equal(storeFront[1], 'Test Store', 'Initial store front value incorrect')
        assert.equal(storeFront[2], 'Nothing to see here, just testing', 'Initial store description incorrect')
        assert.equal(storeFront[3], storeOwner1, 'Initial store owner incorrect')
        assert.isTrue(storeFront[4], 'Store initially not online')
        const editStoreFront = await marketplace.editStoreFront(
            0,
            'Edited Store Front Name',
            'Edited description',
            false,
            {from: storeOwner1}
        )
        storeFront = await marketplace.storeFronts(0);
        assert.equal(storeFront[1], 'Edited Store Front Name', 'Store front name did not update')
        assert.equal(storeFront[2], 'Edited description', 'Store front description did not update')
        assert.equal(storeFront[3], storeOwner1, 'Store owner should not have changed')
        assert.isFalse(storeFront[4], 'Store front should not be online')
    })

    it('Should fail if the Store Owner is not the caller', async() => {
        let storeFront = await marketplace.storeFronts(0);
        try {
            const editStoreFront = await marketplace.editStoreFront(
                0,
                'Edited Store Front Name',
                'Edited description',
                false,
                {from: storeOwner2}
            )
            throw('Operation should have failed')
        } catch(e) {
            assert.match(e, /VM Exception while processing transaction: revert/, 'A store owner should not be able to edit a store they do not own');
        }
    })

    it('Should add a product', async() => {
        let newProduct = await marketplace.addProduct(
            0,
            'Product 1',
            'Test product #1 for Store Front 0',
            999,
            12,
            {from: storeOwner1}
        )
        let addedProduct = await marketplace.products(0)
        assert.equal(addedProduct[0].toNumber(), 0, 'The product should belong to Store Front 0')
        assert.equal(addedProduct[1], storeOwner1, 'The product should belong to Store Owner 1')
        assert.equal(addedProduct[2], 'Product 1', 'The product should have the name "Product 1"')
        assert.equal(addedProduct[3], 'Test product #1 for Store Front 0', 'The product should have the description "Test product #1 for Store Front 0"')
        assert.equal(addedProduct[4].toNumber(), 999, 'The product should have an inventory of 999')
        assert.equal(addedProduct[5].toNumber(), 12, 'The product should have a price of 12')
    })

    it('Should edit a product', async() => {
        let product = await marketplace.products(0)
        assert.equal(product[0].toNumber(), 0, 'The product before editing should belong to Store Front 0')
        assert.equal(product[1], storeOwner1, 'The product before editing should belong to Store Owner 1')
        assert.equal(product[2], 'Product 1', 'The product before editing should have the name "Product 1"')
        assert.equal(product[3], 'Test product #1 for Store Front 0', 'The product before editing should have the description "Test product #1 for Store Front 0"')
        assert.equal(product[4].toNumber(), 999, 'The product before editing should have an inventory of 999')
        assert.equal(product[5].toNumber(), 12, 'The product before editing should have a price of 12')

        const updateProduct = await marketplace.editProduct(
            0,
            'Updated name',
            'Updated description',
            544,
            2000000000,
            {from: storeOwner1}
        )
        product = await marketplace.products(0)
        assert.equal(product[0].toNumber(), 0, 'The product before editing should belong to Store Front 0')
        assert.equal(product[1], storeOwner1, 'The product before editing should belong to Store Owner 1')
        assert.equal(product[2], 'Updated name', 'The product should have the name "Updated Name"')
        assert.equal(product[3], 'Updated description', 'The product should have the description "Updated description"')
        assert.equal(product[4].toNumber(), 544, 'The product should have an inventory of 544')
        assert.equal(product[5].toNumber(), 2000000000, 'The product should have a price of 2000000000')
    })

    it('Should fail if the editor is not the product owner', async() => {
        try {
            const updateProduct = await marketplace.editProduct(
                0,
                'Should fail',
                'Should fail',
                111,
                123,
                {from: storeOwner2}
            )
            throw('Operation should have failed')
        } catch(e) {
            assert.match(e, /VM Exception while processing transaction: revert/, 'Only the store front owner can edit the product')
        }
    })

    it('Should purchase a product', async() => {
        const buyerPreBalance = await web3.eth.getBalance(cust1).toNumber()
        const storePreBalance = await marketplace.storeOwners(storeOwner1)
        const marketplacePreBalance = await marketplace.balance()
        const productPreSale = await marketplace.products(0)
        const purchasePrice = 2000000000 * 5 // item price * quantity
        const buyProduct = await marketplace.buyProduct(0, 5, {value: purchasePrice})
        const buyerAfterBalance = await web3.eth.getBalance(cust1).toNumber()
        const storeAfterBalance = await marketplace.storeOwners(storeOwner1)
        const marketplaceAfterBalance = await marketplace.balance()
        const productAfterSale = await marketplace.products(0)
        assert.isAtMost(buyerAfterBalance, buyerPreBalance + purchasePrice, 'The customer balance should have been debited')
        assert.equal(
            storePreBalance[1].toNumber() + (purchasePrice * .9),
            storeAfterBalance[1].toNumber(), 
            '90% of the sale should be credited to the store owner')
        assert.equal(
            marketplacePreBalance.toNumber() + (purchasePrice * .1),
            marketplaceAfterBalance.toNumber(),
            '10% of the sale should be credited to the marketplace. Nobody works for free!'
        )
        assert.equal(
            productPreSale[4].toNumber() - 5,
            productAfterSale[4].toNumber(),
            'The product sales were not deducted from inventory'
        )
    })

    it('Should update balances and inventory for multiple purchases', async() => {
        const storePreBalance = await marketplace.storeOwners(storeOwner1)
        const marketplacePreBalance = await marketplace.balance()
        const productPreSale = await marketplace.products(0)
        const purchasePrice = 2000000000 * 10 // item price * quantity
        const buyProduct = await marketplace.buyProduct(0, 10, {value: purchasePrice})
        const storeAfterBalance = await marketplace.storeOwners(storeOwner1)
        const marketplaceAfterBalance = await marketplace.balance()
        const productAfterSale = await marketplace.products(0)
        assert.equal(
            storePreBalance[1].toNumber() + (purchasePrice * .9),
            storeAfterBalance[1].toNumber(),
            '90% of the sale should be credited to the store owner in addition to previous balance'
        )
        assert.equal(
            marketplacePreBalance.toNumber() + (purchasePrice * .1),
            marketplaceAfterBalance.toNumber(),
            '10% of the sale should be credited to the market place in addition to the previous balance'
        )
        assert.equal(
            productPreSale[4].toNumber() - 10,
            productAfterSale[4].toNumber(),
            'Product inventory should reflect total units sold'
        )
    })

    it('Should validate the price and quantity', async() => {
        try {
            const buyProduct = await marketplace.buyProduct(0, 2, {value: 1})
            throw('Operation should have failed')
        } catch(e) {
            assert.match(e, /VM Exception while processing transaction: revert/, 'msg.value should equal quantity * price')
        }
    })

    /**************************************************************************
     *              Account balances and withdraws
     **************************************************************************/

    it('Should withdraw Store Owner funds', async() => {
        const fundsEarned = 27000000000 // hardcoded value for funds earned based on previous tests. 
        const initialBalance = await marketplace.storeOwners(storeOwner1)
        const storeOwnerPreBalance = await web3.eth.getBalance(storeOwner1).toNumber()
        const withdraw = await marketplace.storeOwnerWithdraw({from: storeOwner1})
        const postBalance = await marketplace.storeOwners(storeOwner1)
        const storeOwnerPostBalance = await web3.eth.getBalance(storeOwner1).toNumber()
        assert.equal(initialBalance[1].toNumber(), fundsEarned, 'Initial funds incorrect. Check for changes to previous tests')
        assert.equal(postBalance[1].toNumber(), 0, 'Store Owner balance should be zero after withdraw')
        assert.isAtMost(
            storeOwnerPostBalance - fundsEarned,
            storeOwnerPreBalance,
            'Store Owner account balance should have increased minus gas cost'
        )
    })

    it('Should return the marketplace balance', async() => {
        const marketplaceFunds = 3000000000 // hardcoded based on sales made from previous tests
        const marketplaceBalance = await marketplace.balance({from: owner})
        assert.equal(marketplaceBalance.toNumber(), marketplaceFunds, 'Funds earned by marketplace incorrect.')
    })

    it('Should allow an admin to withdraw marketplace funds', async() => {
        const marketplaceFunds = 3000000000 // hardcoded based on sales made from previous tests
        const amountToWithdraw = 1234567890
        const initialBalance = await web3.eth.getBalance(owner).toNumber()
        const preWithdrawMarketplace = await marketplace.balance()
        const withdrawFunds = await marketplace.withdrawMarketplaceFunds(amountToWithdraw, {from: owner})
        const postBalance = await web3.eth.getBalance(owner).toNumber()
        const postWithdrawMarketplace = await marketplace.balance()
        assert.isAtMost(
            postBalance - amountToWithdraw,
            initialBalance,
            'Owner account balance should have increased, minus gas cost'
        )
        assert.equal(
            postWithdrawMarketplace.toNumber(),
            preWithdrawMarketplace.toNumber() - amountToWithdraw,
            'The marketplace balance should reflect the withdraw'
        )
    })

    it('Should only allow admins to withdraw marketplace funds', async() => {
        try {
            const withdraw = await marketplace.withdrawMarketplaceFunds(1, {from: storeOwner1})
            throw('Operation should have failed')
        } catch(e) {
            assert.match(e, /VM Exception while processing transaction: revert/, 'Only admins should be allowed to withdraw from the marketplace')
        }
    })

    it('Should not allow withdraw to exceed balance', async() => {
        try {
            const withdraw = await marketplace.withdrawMarketplaceFunds(5000000000, {from: owner})
            throw('Operation should have failed')
        } catch(e) {
            assert.match(e, /VM Exception while processing transaction: revert/, 'Insufficient funds')
        }
    })
})
