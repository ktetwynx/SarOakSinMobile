import {legacy_createStore as createStore} from 'redux';
import {App} from './reducers';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, App);

let store = createStore(persistedReducer);
let persistor = persistStore(store);

export default store;
