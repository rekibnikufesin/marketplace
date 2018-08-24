import constants        from '../../core/types'
import contract         from 'truffle-contract'
import Marketplace      from '../../build/contracts/Marketplace.json'
import web3             from 'web3'


function getNextStoreFrontId(MarketplaceContract, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.nextStoreFrontId()
    })
    .then(result => {
        if (result) {
            resolve(result.toNumber())
        }
    })
    .catch(error => {
        reject(error)
    })
}

function getAStoreFront(MarketplaceContract, id) {
    return new Promise((resolve, reject) => {
        getStoreFrontById(MarketplaceContract, id, resolve, reject)
    })
}

function getStoreFrontById(MarketplaceContract, storeId, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.storeFronts(storeId)
    })
    .then(result => {
        if (result) {
            resolve(result)
        }
    })
    .catch(error => {
        console.log(error)
        reject(error)
    })
}

function getProducts(MarketplaceContract, id) {
    return new Promise((resolve, reject) => {
        MarketplaceContract.deployed().then((marketplacecontract) => {
            return marketplacecontract.getProductsForStore(id)
        })
        .then(result => {
            resolve(result)
        })
        .catch(error => {
            reject(error)
        })
    })
}

function getProduct(MarketplaceContract, productId) {
    return new Promise((resolve, reject) => {
        MarketplaceContract.deployed().then((marketplacecontract) => {
            return marketplacecontract.products(productId)
        })
        .then(result => {
            resolve(result)
        })
        .catch(error => {
            reject(error)
        })
    })
}

function submitBuyToNetwork(MarketplaceContract, productId, quantity, price, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.buyProduct(
            productId, 
            quantity,
            {
                value: web3.utils.toWei(price, 'ether') * quantity
            }
        )
    })
    .then(result => {
        if (result) {
            MarketplaceContract.deployed().then((marketplacecontract) => {
                marketplacecontract.ProductBought().watch((error, response) => {
                    if (error) {
                        reject(error)
                    }
                    resolve(response)
                })
            })
        }
    })
}

function dispatchStoreFrontsComplete(storefronts, dispatch) {
    dispatch((() => {
        return {
            type: constants.SHOPPER_STOREFRONTS,
            storeFronts: storefronts,
            success: true
        }
    })())
}

function dispatchProductBoughtComplete(event, dispatch) {
    dispatch((() => {
        return {
            type: constants.PRODUCT_BOUGHT,
            product: event.transactionHash,
            success: true
        }
    })())
}

function dispatchProductBoughtFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.PRODUCT_BOUGHT,
            success: false
        }
    }))
}

export function getAllStoreFronts() {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        populateStoreFronts(MarketplaceContract)
        .then(storeFronts => {
            populateProducts(MarketplaceContract, storeFronts)
            .then(storeFronts => {
                dispatchStoreFrontsComplete(storeFronts, dispatch)
            })
        })
        
    }
}

function populateStoreFronts(MarketplaceContract) {
    return new Promise((storesResolve, storesReject) => {
        return new Promise((resolve, reject) => {
            getNextStoreFrontId(MarketplaceContract, resolve, reject)
        })
        .then(nextStoreFrontId => {
            let promises = []
            for (let i = 0; i < nextStoreFrontId; i++) {
                promises.push(getAStoreFront(MarketplaceContract, i))
            }
            Promise.all(promises)
            .then(promises => {
                let storeFronts = []
                promises.map((store) => {
                    let formattedStore = {
                        id: store[0].toNumber(),
                        name: store[1],
                        description: store[2],
                        online: store[4],
                        products: []
                    }
                    storeFronts.push(formattedStore)
                    storesResolve(storeFronts)
                })
            })
        })
    })
}

function populateProducts(MarketplaceContract, storeFronts) {
    return new Promise((prodResolve, prodReject) => {
        let storePromises = []
        storeFronts.forEach(store => {
            storePromises.push(populateProductsByStore(MarketplaceContract, store.id))
        })
        Promise.all(storePromises)
        .then(productList => {
            productList.forEach(list => {
                list.forEach(item => {
                    let st = storeFronts.find(store => store.id === item.storeId)
                    st.products.push(item)
                })
            })
            prodResolve(storeFronts)
        })
    })
}

function populateProductsByStore(MarketplaceContract, storeId) {
    return new Promise((prodResolve, prodRejct) => {
        getProducts(MarketplaceContract, storeId)
        .then(prod => {
            let promises = []
            prod.forEach(p => {
                promises.push(populateProduct(MarketplaceContract, p.toNumber()))
            })
            Promise.all(promises)
            .then(products => {
                prodResolve(products)
            })
        })
    })
}

function populateProduct(MarketplaceContract, productId) {
    return new Promise((prodResolve, prodReject) => {
        getProduct(MarketplaceContract, productId)
        .then(prod => {
            let product = {
                productId: productId,
                storeId: prod[0].toNumber(),
                name: prod[2],
                description: prod[3],
                inventory: prod[4],
                price: web3.utils.fromWei(prod[5].toString(), 'ether')
            }
            prodResolve(product)
        })
    })
}

export function buyItem(productId, quantity, price) {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            submitBuyToNetwork(MarketplaceContract, productId, quantity, price, resolve, reject)
        })
        .then(event => {
            if (event) {
                dispatchProductBoughtComplete(event, dispatch)
            } else {
                dispatchProductBoughtFailed(dispatch)
            }
        })
        .catch(error => {
            console.log(error)
            dispatchProductBoughtFailed(dispatch)
        })
    }
}
