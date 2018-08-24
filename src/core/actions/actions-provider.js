import constants from 'core/types'

/**
 * setProvider - Set the Provider (MetaMask)
 */
export function setProvider(provider) {
  return (dispatch) => {
    provider.eth.getAccounts((error, accounts) => {
      if (error) { return }

      const userAccount = accounts[0]

      /* Set the default account */
      provider.eth.defaultAccount = userAccount

      dispatch((() => {
        return {
          type: constants.SET_PROVIDER,
          provider: provider,
          account: userAccount
        }
      })())
    })
  }
}

export function updateAddress(newAddress) {
  return (dispatch) => {
    dispatch((() => {
      return {
        type: constants.UPDATE_ADDRESS,
        account: newAddress
      }
    })())
  }
}
