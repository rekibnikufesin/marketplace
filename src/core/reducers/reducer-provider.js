import constants from 'core/types'

const initialState = {
  web3Provider: null,
  account: null,
}

export function providerReducer(state = initialState, action) {
  switch (action.type) {

  case constants.SET_PROVIDER:
    return Object.assign({}, state, {
      web3Provider: action.provider,
      account: action.account
    })

  case constants.UPDATE_ADDRESS:
    return Object.assign({}, state, {
      account: action.newAddress
    })

  default:
    return state
  }
}
