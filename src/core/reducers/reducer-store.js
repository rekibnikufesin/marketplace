import constants from 'core/types'

const initialState = {
    isOwner: false,
    storeFrontId: '',
    storeFronts: [],
    storeFrontUpdate: '',
    products: '',
    storeFrontProducts: [],
    tx: '',
}

export function storeReducer(state = initialState, action) {
    switch(action.type) {
    case constants.IS_STOREOWNER:
        return Object.assign({}, state, {
            isOwner: action.transaction[0],
            balance: action.balance
        })

    case constants.NEW_STOREFRONTID:
        return Object.assign({}, state, {
            storeFrontId: action.id
        })

    case constants.STOREFRONTS:
        return Object.assign({}, state, {
            storeFronts: action.storefronts
        })

    case constants.STOREFRONT_UPDATE:
        return Object.assign({}, state, {
            storeFrontUpdate: action.tx
        })

    case constants.STOREFRONT_PRODUCTS:
        return Object.assign({}, state, {
            storeFrontProducts: action.products
        })

    case constants.PRODUCT_ADDED:
        return Object.assign({}, state, {
            products: action.productId
        })

    case constants.PRODUCT_UPDATED:
        return Object.assign({}, state, {
            products: action.updatedProductId
        })

    case constants.OWNERFUNDS_WITHDRAW:
        return Object.assign({}, state, {
            balance: action.balance,
            withdraw: action.tx
        })

    default:
        return state
    }
}