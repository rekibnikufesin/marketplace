import constants    from '../../core/types'
import contract     from 'truffle-contract'
import Marketplace  from '../../build/contracts/Marketplace.json'
import web3         from 'web3'

function getAdminStatus(MarketplaceContract, address, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.admins(address)
    })
    .then((result) => {
        if (result) {
            MarketplaceContract.deployed().then((marketplacecontract) => {
                return marketplacecontract.balance()
            })
            .then(balanceTx => {
                if (balanceTx) {
                    let data = {
                        isAdmin: result[0],
                        balance: balanceTx
                    }
                    resolve(data)
                }
            })
        }
    })
    .catch((error) => {
        reject(error)
    })
}

function addNewAdmin(MarketplaceContract, name, address, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.addAdmin(address)
    })
    .then(result => {
        MarketplaceContract.deployed().then((marketplacecontract) => {
            marketplacecontract.AdminAdded().watch((error, response) => {
                if(error) {
                    reject(error)
                }
                resolve(response.args.newAdmin)
            })
        })
    })
    .catch((error) => {
        reject(error)
    })
}

function addNewStoreOwner(MarketplaceContract, address, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.addStoreOwner(address)
    })
    .then(result => {
        MarketplaceContract.deployed().then((marketplacecontract) => {
            marketplacecontract.StoreOwnerAdded().watch((error, response) => {
                if(error) {
                    reject(error)
                }
                resolve(response.args.storeOwner)
            })
        })
    })
    .catch((error) => {
        reject(error)
    })
}

function withdrawFundsFromContract(MarketplaceContract, amount, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.withdrawMarketplaceFunds(amount)
    })
    .then(result => {
        if (result) {
            MarketplaceContract.deployed().then((marketplacecontract) => {
                marketplacecontract.AdminWithdrewFunds().watch((error, response) => {
                    if (error) {
                        reject(error)
                    }
                    resolve(response)
                })
            })
            .catch(error => {
                reject(error)
            })
        }
    })
    .catch(error => {
        reject(error)
    })
}

function setMarketplaceStatus(MarketplaceContract, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.toggleOnline()
    })
    .then(event => {
        MarketplaceContract.deployed().then((marketplacecontract) => {
            marketplacecontract.ToggleMarketplace().watch((error, response) => {
                if (error) {
                    reject(error)
                }
                resolve(response)
            })
        })
    })
    .catch(error => {
        reject(error)
    })
}

function getStatus(MarketplaceContract, resolve, reject) {
    MarketplaceContract.deployed().then((marketplacecontract) => {
        return marketplacecontract.online()
    })
    .then(result => {
        resolve(result)
    })
    .catch(error => {
        reject(error)
    })
}

function dispatchGetAdminComplete(transaction, dispatch) {
    dispatch((() => {
        return {
            type: constants.IS_ADMIN,
            isAdmin: transaction.isAdmin,
            balance: web3.utils.fromWei(transaction.balance.toString(), 'ether'),
            success: true
        }
    })())
}

function dispatchGetAdminFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.IS_ADMIN,
            success: false
        }
    })())
}

function dispatchAddAdminComplete(transaction, dispatch) {
    dispatch((() => {
        return {
            type: constants.ADMIN_ADDED,
            adminTx: transaction,
            success: true
        }
    })())
}

function dispatchAddAdminFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.ADMIN_ADDED,
            success: false
        }
    })())
}

function dispatchAddStoreOwnerComplete(event, dispatch) {
    dispatch((() => {
        return {
            type: constants.STOREOWNER_ADDED,
            storeOwnerTx: event,
            success: true
        }
    })())
}

function dispatchAddStoreOwnerFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.STOREOWNER_ADDED,
            success: false
        }
    })())
}

function dispatchWithdrawFundsComplete(event, dispatch) {
    dispatch((() => {
        return {
            type: constants.ADMIN_WITHDRAW,
            balance: web3.utils.fromWei(event.args.balance.toString(), 'ether'),
            tx: event.transactionHash,
            success: true
        }
    })())
}

function dispatchWithdrawFundsFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.ADMIN_WITHDRAW,
            success: false
        }
    }))
}

function dispatchMarketplaceToggleComplete(event, dispatch) {
    dispatch((() => {
        return {
            type: constants.MARKETPLACE_STATUS,
            marketplaceStatus: event.args.status,
            caller: event.args.caller,
            success: true
        }
    })())
}

function dispatchMarketplaceToggleFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.MARKETPLACE_STATUS,
            success: false
        }
    })())
}

function dispatchMarketplaceStatusComplete(response, dispatch) {
    dispatch((() => {
        return {
            type: constants.MARKETPLACE_STATUS,
            marketplaceStatus: response,
            success: true
        }
    })())
}

function dispatchMarketplaceStatusFailed(dispatch) {
    dispatch((() => {
        return {
            type: constants.MARKETPLACE_STATUS,
            success: false
        }
    })())
}

export function isAdmin() {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            getAdminStatus(MarketplaceContract, web3Provider.eth.defaultAccount, resolve, reject)
        })
        .then((transaction) => {
            if (transaction) {
                dispatchGetAdminComplete(transaction, dispatch)
            } else {
                dispatchGetAdminFailed(dispatch)
            }
        })
    }
}

export function addAdmin(name, address) {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            addNewAdmin(MarketplaceContract, name, address, resolve, reject)
        })
        .then((event) => {
            if (event) {
                dispatchAddAdminComplete(event, dispatch)
            } else {
                dispatchAddAdminFailed(dispatch)
            }
        })
    }
}

export function addStoreOwner(address) {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            addNewStoreOwner(MarketplaceContract, address, resolve, reject)
        })
        .then((event) => {
            if(event) {
                dispatchAddStoreOwnerComplete(event, dispatch)
            } else {
                dispatchAddStoreOwnerFailed(dispatch)
            }
        })
    }
}

export function withdrawFunds(amount) {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            withdrawFundsFromContract(MarketplaceContract, web3.utils.toWei(amount, 'ether'), resolve, reject)
        })
        .then(event => {
            if (event) {
                dispatchWithdrawFundsComplete(event, dispatch)
            } else {
                dispatchWithdrawFundsFailed(dispatch)
            }
        })
        .catch(error => {
            dispatchWithdrawFundsFailed(dispatch)
        })
    }
}

export function toggleMarketplace() {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            setMarketplaceStatus(MarketplaceContract, resolve, reject)
        })
        .then(event => {
            if (event) {
                getMarketplaceStatus()
                dispatchMarketplaceToggleComplete(event, dispatch)
            } else {
                dispatchMarketplaceToggleFailed(dispatch)
            }
        })
        .catch(error => {
            console.log('Failed to toggle Marketplace: ', error)
            dispatchMarketplaceToggleFailed(dispatch)
        })
    }
}

export function getMarketplaceStatus() {
    return (dispatch, getState) => {
        const { web3Provider } = getState().provider
        const MarketplaceContract = contract(Marketplace)
        MarketplaceContract.setProvider(web3Provider.currentProvider)
        MarketplaceContract.defaults({from: web3Provider.eth.defaultAccount})

        return new Promise((resolve, reject) => {
            getStatus(MarketplaceContract, resolve, reject)
        })
        .then(response => {
            dispatchMarketplaceStatusComplete(response, dispatch)
        })
        .catch(error => {
            console.log('Failed to retrieve marketplace status: ', error)
            dispatchMarketplaceStatusFailed(dispatch)
        })
    }
}
