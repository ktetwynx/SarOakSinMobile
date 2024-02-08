import {configureStore} from '@reduxjs/toolkit';
import {App} from './reducers';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, App);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (
    getDefaultMiddleware: (arg0: {serializableCheck: boolean}) => any,
  ) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export const persistor = persistStore(store);

export default store;
