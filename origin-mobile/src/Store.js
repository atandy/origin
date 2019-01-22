import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'

import activation from 'reducers/Activation'
import devices from 'reducers/Devices'
import exchangeRates from 'reducers/ExchangeRates'
import notifications from 'reducers/Notifications'
import users from 'reducers/Users'
import wallet from 'reducers/Wallet'
import wallet_events from 'reducers/WalletEvents'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  storage: storage,
  whitelist: [
    'notifications',
    'wallet_events',
  ]
}

const middlewares = [thunkMiddleware]

const store = createStore(
  persistReducer(persistConfig, 
    combineReducers({
      activation,
      devices,
      exchangeRates,
      notifications,
      users,
      wallet,
      wallet_events,
    })),
  applyMiddleware(...middlewares)
)

const persistor = persistStore(store)

export default store
