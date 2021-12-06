import React, { createContext, useContext, ReactNode } from 'react';
// @ts-ignore
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread.js';
import { wrap } from 'comlink/dist/esm/comlink';

import DBWorker from './db.worker?worker';
import type { DBClass } from './db.worker';

const worker: Worker = new DBWorker();
const instance = wrap<DBClass>(worker);
initBackend(worker);

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.db = instance;
}

const LocalDBContext = createContext(instance);
export const useLocalDB = () => useContext(LocalDBContext);

const LocalDBProvider = ({ children }: { children: ReactNode }) => {
  return <LocalDBContext.Provider value={instance}>{children}</LocalDBContext.Provider>;
};

export default LocalDBProvider;
