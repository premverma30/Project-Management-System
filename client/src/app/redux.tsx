// import { useRef } from "react";
// import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import {
//   TypedUseSelectorHook,
//   useDispatch,
//   useSelector,
//   Provider,
// } from "react-redux";
// import globalReducer from "@/state";
// import { api } from "@/state/api";
// import { setupListeners } from "@reduxjs/toolkit/query";

// import {
//   persistStore,
//   persistReducer,
//   FLUSH,
//   REHYDRATE,
//   PAUSE,
//   PERSIST,
//   PURGE,
//   REGISTER,
// } from "redux-persist";
// import { PersistGate } from "redux-persist/integration/react";
// import createWebStorage from "redux-persist/lib/storage/createWebStorage";

// /* REDUX PERSISTENCE */
// const createNoopStorage = () => {
//   return {
//     getItem(_key: any) {
//       return Promise.resolve(null);
//     },
//     setItem(_key: any, value: any) {
//       return Promise.resolve(value);
//     },
//     removeItem(_key: any) {
//       return Promise.resolve();
//     },
//   };
// };

// const storage =
//   typeof window === "undefined"
//     ? createNoopStorage()
//     : createWebStorage("local");

// const persistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["global"],
// };
// const rootReducer = combineReducers({
//   global: globalReducer,
//   [api.reducerPath]: api.reducer,
// });
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// /* REDUX STORE */
// export const makeStore = () => {
//   return configureStore({
//     reducer: persistedReducer,
//     middleware: (getDefault) =>
//       getDefault({
//         serializableCheck: {
//           ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//         },
//       }).concat(api.middleware),
//   });
// };

// /* REDUX TYPES */
// export type AppStore = ReturnType<typeof makeStore>;
// export type RootState = ReturnType<AppStore["getState"]>;
// export type AppDispatch = AppStore["dispatch"];
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// /* PROVIDER */
// export default function StoreProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const storeRef = useRef<AppStore | undefined>(undefined);
//   const persistorRef = useRef<any>(undefined);

//   if (!storeRef.current) {
//     storeRef.current = makeStore();
//     setupListeners(storeRef.current.dispatch);
//     persistorRef.current = persistStore(storeRef.current);
//   }

//   return (
//     <Provider store={storeRef.current}>
//       <PersistGate loading={null} persistor={persistorRef.current}>
//         {children}
//       </PersistGate>
//     </Provider>
//   );
// }
















import React, { useRef } from "react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  Provider,
} from "react-redux";
import globalReducer from "@/state";
import { api } from "@/state/api";
import { setupListeners } from "@reduxjs/toolkit/query";

import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

/* REDUX PERSISTENCE */
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

// Strip transient session credentials before persisting the global slice.
// backendToken / mongoId are re-populated on every page load by SessionSync
// from the NextAuth httpOnly cookie — they must NOT be written to localStorage.
const stripSessionTransform = createTransform(
  // inbound: runs before persisting
  (inboundState: any) => {
    const { backendToken, mongoId, ...rest } = inboundState;
    return rest;
  },
  // outbound: runs when rehydrating — pass through as-is
  (outboundState: any) => outboundState,
  { whitelist: ["global"] },
);

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["global"],
  transforms: [stripSessionTransform],
};

const rootReducer = combineReducers({
  global: globalReducer,
  [api.reducerPath]: api.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

/* REDUX STORE */
export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware: any) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            FLUSH,
            REHYDRATE,
            PAUSE,
            PERSIST,
            PURGE,
            REGISTER,
          ],
        },
      }).concat(api.middleware),
  });

  return store;
};

/* REDUX TYPES */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* PROVIDER */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  const persistorRef = useRef<any>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
    persistorRef.current = persistStore(storeRef.current);
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current}>
        {children}
      </PersistGate>
    </Provider>
  );
}