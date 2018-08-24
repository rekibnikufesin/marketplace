import constants        from '../../core/types'
import contract         from 'truffle-contract'
import Marketplace      from '../../build/contracts/Marketplace.json'
import web3             from 'web3'

function getOwnerStatus(MarketplaceContract, address, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.storeOwners(address)
    })
    .then((result) => {
        const transaction = (result !== null) ? result: null
        resolve(transaction)
    })
    .catch((error) => {
        reject(error)
    })
}

function addNewStoreFront(MarketplaceContract, name, desc, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.addStoreFront(name, desc)
    })
    .then(result => {
        MarketplaceContract.deployed().then((marketplacecontract) => {
            marketplacecontract.NewStoreFrontId().watch((error, response) => {
                if (error) {
                    reject(error)
                }
                resolve(response)
            })
        })
    })
    .catch((error) => {
        reject(error)
    })
}

function getStoreFrontList(MarketplaceContract, address, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.getStoresForOwner()
    })
    .then(result => {
        resolve(result)
    })
    .catch((error) => {
        reject(error)
    })
}

function getStoreFrontById(MarketplaceContract, id, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.storeFronts(id)
    })
    .then(result => {
        resolve(result)
    })
    .catch((error) => {
        reject(error)
    })
}

function updateStore(MarketplaceContract, id, name, desc, online, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.editStoreFront(id, name, desc, online)
    })
    .then(result => {
        resolve(result)
    })
    .catch((error) => {
        reject(error)
    })
}

function getProducts(MarketplaceContract, id, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.getProductsForStore(id)
    })
    .then(result => {
        resolve(result)
    })
    .catch(error => {
        reject(error)
    })
}

function getProduct(MarketplaceContract, productId, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.products(productId)
    })
    .then(result => {
        resolve(result)
    })
    .catch(error => {
        reject(error)
    })
}

function addNewProduct(MarketplaceContract, storefrontid, name, desc, price, inv, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.addProduct(
            storefrontid, 
            name, 
            desc, 
            inv, 
            web3.utils.toWei(price, 'ether')
        )
    })
    .then(result => {
        if (result) {
            MarketplaceContract.deployed().then((marketplacecontract) => {
                marketplacecontract.ProductAdded().watch((error, response) => {
                    if (error) {
                        reject(error)
                    }
                    resolve(response)
                })
            })
        }
    })
}

function editProduct(MarketplaceContract, id, name, desc, inventory, price, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.editProduct(
            id, 
            name, 
            desc, 
            inventory, 
            web3.utils.toWei(price, 'ether')
        )
    })
    .then(result => {
        if (result) {
            MarketplaceContract.deployed().then((marketplacecontract) => {
                marketplacecontract.ProductEdited().watch((error, response) => {
                    if (error) {
                        reject(error)
                    }
                    resolve(response)
                })
            })
        }
    })
}

function withdrawFundsFromContract(MarketplaceContract, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.storeOwnerWithdraw({gas: 50000})
    })
    .then(result => {
        if (result) {
            MarketplaceContract.deployed().then((marketplacecontract) => {
                marketplacecontract.StoreOwnerWithdraw().watch((error, response) => {
                    if (error) {
                        reject(error)
                    }
                    resolve(response)
                })
            })
        }
    })
}

function dispatchGetOwnerComplete(transaction, dispatch) {
    dispatch((() => {
        return {
            type: constants.IS_STOREOWNER,
            isStoreOwner: transaction[0],
            balance: web3.utils.fromWei(transaction[1].toString(), 'ether'),
            transaction: transaction,
            success: true
        }
    })())
}

function dispatchGetOwnerFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.IS_STOREOWNER,
            isStoreOwner: false,
            success: false
        }
    })())
}

function dispatchNewStoreFrontComplete(event, dispatch) {
    dispatch((() => {
        return {
            type: constants.NEW_STOREFRONTID,
            id: event.args.id.toNumber(),
            success: true
        }
    })())
}

function dispatchNewStoreFrontFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.NEW_STOREFRONTID,
            success: false
        }
    })())
}

function dispatchStoreFrontsComplete(results, dispatch) {
    dispatch((() => {
        return {
            type: constants.STOREFRONTS,
            storefronts: results,
            success: true
        }
    })())
}

function dispatchStoreFrontsFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.STOREFRONTS,
            success: false
        }
    }))
}

function dispatchStoreFrontEditComplete(results, dispatch) {
    dispatch((() => {
        return {
            type: constants.STOREFRONT_UPDATE,
            tx: results.tx,
            success: true
        }
    })())
}

function dispatchStoreFrontEditFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.STOREFRONT_UPDATE,
            success: false
        }
    })())
}

function dispatchNewProductAdded(event, dispatch) {
    dispatch((() => {
        return {
            type: constants.PRODUCT_ADDED,
            productId: event.args.id.toNumber(),
            success: true
        }
    })())
}

function dispatchNewProductFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.PRODUCT_ADDED,
            success: false
        }
    })())
}

function dispatchProductEditSuccess(event, dispatch) {
    dispatch((() => {
        return {
            type: constants.PRODUCT_UPDATED,
            updatedProductId: event.args.id.toNumber(),
            success: true
        }
    })())
}

function dispatchProductEditFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.PRODUCT_UPDATED,
            success: false
        }
    })())
}

function dispatchFundsWithdrawComplete(event, transaction, dispatch) {
    dispatch((() => {
        return {
            type: constants.OWNERFUNDS_WITHDRAW,
            balance: web3.utils.fromWei(transaction[1].toString(), 'ether'),
            tx: event.transactionHash,
            success: true
        }
    })())
}

function dispatchFundsWithdrawFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.OWNERFUNDS_WITHDRAW,
            success: false
        }
    }))
}

export function isStoreOwner() {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})
    
        return new Promise((resolve, reject) => {
            getOwnerStatus(MarketplaceContract, web3Provider.eth.defaultAccount, resolve, reject)
        })
        .then((transaction) => {
            if (transaction) {
                dispatchGetOwnerComplete(transaction, dispatch)
            } else {
                dispatchGetOwnerFailed(dispatch)
            }
        })
    }
}

export function addStoreFront(name, desc) {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            addNewStoreFront(MarketplaceContract, name, desc, resolve, reject)
        })
        .then((event) => {
            if (event) {
                dispatchNewStoreFrontComplete(event, dispatch)
            } else {
                dispatchNewStoreFrontFailed(dispatch)
            }
        })
    }
}

export function getStoreFronts() {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            getStoreFrontList(MarketplaceContract, web3Provider.eth.defaultAccount, resolve, reject)
        })
        .then((results) => {
            if (results) {
                let storeFronts = []
                results.forEach(function(id) {
                    return new Promise((resolve, reject) => {
                        getStoreFrontById(MarketplaceContract, id, resolve, reject)
                    })
                    .then((result) => {
                        if (result) {
                            let products = []
                            return new Promise((resolve, reject) => {
                                getStoreProducts(MarketplaceContract, id.toNumber(), resolve, reject)
                            })
                            .then((results) => {
                                products = results
                                const sf = {
                                    'id': result[0].toNumber(),
                                    'name': result[1],
                                    'description': result[2],
                                    'online': result[4],
                                    'products': products
                                }
                                storeFronts.push(sf)
                            })
                            .catch((error) => {
                            })
                        }
                    })
                    .then(() => {
                        dispatchStoreFrontsComplete(storeFronts, dispatch)
                    })
                })
            } else {
                dispatchStoreFrontsFailed(dispatch)
            }
        })
    }
}

function refreshStoreFronts(MarketplaceContract, web3Provider, dispatch, sfResolve, sfReject) {
    return new Promise((resolve, reject) => {
        getStoreFrontList(MarketplaceContract, web3Provider.eth.defaultAccount, resolve, reject)
    })
    .then((results) => {
        if (results) {
            let storeFronts = []
            results.forEach(function(id) {
                return new Promise((resolve, reject) => {
                    getStoreFrontById(MarketplaceContract, id, resolve, reject)
                })
                .then((result) => {
                    if (result) {
                        let products = []
                        return new Promise((resolve, reject) => {
                            getStoreProducts(MarketplaceContract, id.toNumber(), resolve, reject)
                        })
                        .then((results) => {
                            products = results
                            const sf = {
                                'id': result[0].toNumber(),
                                'name': result[1],
                                'description': result[2],
                                'online': result[4],
                                'products': products
                            }
                            storeFronts.push(sf)
                        })
                        .catch((error) => {
                        })
                    }
                })
                .then(() => {
                    dispatchStoreFrontsComplete(storeFronts, dispatch)
                    sfResolve()
                })
            })
        } else {
            dispatchStoreFrontsFailed(dispatch)
            sfReject()
        }
    })
}

export function updateStoreFront(id, name, desc, online) {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            updateStore(MarketplaceContract, id, name, desc, online, resolve, reject)
        })
        .then((results) => {
            if (results) {
                dispatchStoreFrontEditComplete(results, dispatch)
            } else {
                dispatchStoreFrontEditFailed(dispatch)
            }
        })
    }
}

function getStoreProducts(MarketplaceContract, id, productResolve, productReject) {
    let products = []
    return new Promise((resolve, reject) => {
            getProducts(MarketplaceContract, id, resolve, reject)
        })
        .then((results) => {
            if (results) {
                results.forEach(function(productId) {
                    return new Promise((resolve, reject) => {
                        getProduct(MarketplaceContract, productId, resolve, reject)
                    })
                    .then(result => {
                        if (result) {
                            let product = {
                                productId: productId.toNumber(),
                                storeFrontId: result[0].toNumber(),
                                name: result[2],
                                desc: result[3],
                                inventory: result[4].toNumber(),
                                price: web3.utils.fromWei(result[5].toString())
                            }
                            products.push(product)
                        }
                    })
                })
            }
            })
        .then(() => {
            productResolve(products)
        })
        .catch((error) => {
            productReject(error)
        })
}

export function addProduct(storefrontid, name, desc, price, inv) {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            addNewProduct(MarketplaceContract, storefrontid, name, desc, price, inv, resolve, reject)
        })
        .then(event => {
            if (event) {
                return new Promise((productResolve, productReject) => {
                    refreshStoreFronts(MarketplaceContract, web3Provider, dispatch, productResolve, productReject)
                    // getStoreProducts(MarketplaceContract, storefrontid, productResolve, productReject)
                })
                .then(() => {
                    dispatchNewProductAdded(event, dispatch)
                })
            } else {
                dispatchNewProductFailed(dispatch)
            }
        })
    }
}

export function updateProduct(id, name, desc, inventory, price) {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            editProduct(MarketplaceContract, id, name, desc, inventory, price, resolve, reject)
        })
        .then(event => {
            if (event) {
                return new Promise((productResolve, productReject) => {
                   refreshStoreFronts(MarketplaceContract, web3Provider, dispatch, productResolve, productReject) 
                })
                .then(() => {
                    dispatchProductEditSuccess(event, dispatch)
                })
            } else {
                dispatchProductEditFailed(dispatch)
            }
        })
    }
}

export function withdrawFunds() {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            withdrawFundsFromContract(MarketplaceContract, resolve, reject)
        })
        .then(event => {
            if (event) {
                return new Promise((ownerResolve, ownerReject) => {
                    getOwnerStatus(MarketplaceContract, web3Provider.eth.defaultAccount, ownerResolve, ownerReject)
                })
                .then(transaction => {
                    dispatchFundsWithdrawComplete(event, transaction, dispatch)
                })
            } else {
                dispatchFundsWithdrawFailed(dispatch)
            }
        })
        .catch(error => {
            console.log(error)
            dispatchFundsWithdrawFailed(dispatch)
        })
    }
}
