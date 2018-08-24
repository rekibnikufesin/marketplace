import { combineReducers } from 'redux'
import { providerReducer } from 'core/reducers/reducer-provider'
import { adminReducer }    from 'core/reducers/reducer-admin'
import { storeReducer }    from 'core/reducers/reducer-store'
import { shopperReducer }  from 'core/reducers/reducer-shopper'

const rootReducer = combineReducers({
  provider: providerReducer,
  admin: adminReducer,
  store: storeReducer,
  shopper: shopperReducer,
})

export default rootReducer
