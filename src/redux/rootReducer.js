import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices
import chatReducer from './slices/chat';
import userReducer from './slices/user';
import productReducer from './slices/product';
import brandReducer from './slices/brand';

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'redux-',
  whitelist: []
};

const productPersistConfig = {
  key: 'product',
  storage,
  keyPrefix: 'redux-',
  whitelist: ['sortBy', 'checkout']
};

const rootReducer = combineReducers({
  chat: chatReducer,
  user: userReducer,
  brand: brandReducer,
  product: persistReducer(productPersistConfig, productReducer)
});

export { rootPersistConfig, rootReducer };
