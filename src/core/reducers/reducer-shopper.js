import constants from 'core/types'

const initialState = {
    stores: [],
}

export function shopperReducer(state = initialState, action) {
    switch(action.type) {

    case constants.SHOPPER_STOREFRONTS:
        return Object.assign({}, state, {
            stores: action.storeFronts    
        })

    case constants.PRODUCT_BOUGHT:
        return Object.assign({}, state, {
            product: action.product
        })

    default:
        return state
    }
}