import constants from 'core/types'

const initialState = {
    isAdmin: false,
    adminTx: null,
    balance: '',
    marketplaceStatus: true,
    caller: '',
}

export function adminReducer(state = initialState, action) {
    switch (action.type) {
    case constants.IS_ADMIN:
        return Object.assign({}, state, {
            isAdmin: action.isAdmin,
            balance: action.balance
        })

    case constants.ADMIN_ADDED:
        return Object.assign({}, state, {
            adminTx: action.adminTx
        })

    case constants.STOREOWNER_ADDED:
        return Object.assign({}, state, {
            storeOwnerTx: action.storeOwnerTx
        })

    case constants.ADMIN_WITHDRAW:
        return Object.assign({}, state, {
            balance: action.balance,
            tx: action.tx,
        })

    case constants.MARKETPLACE_STATUS:
        return Object.assign({}, state, {
            marketplaceStatus: action.marketplaceStatus,
            caller: action.caller
        })

    default:
        return state
    }
}