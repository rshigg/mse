import React, { createContext, useContext, ReactNode } from 'react';
// @ts-ignore
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread.js';
import { wrap } from 'comlink/dist/esm/comlink';

import MainWorker from './main.worker?worker';

const worker: Worker = new MainWorker();
const instance = wrap<import('./main.worker').MainWorker>(worker);
initBackend(worker);

const WorkerContext = createContext(instance);
export const useWorker = () => useContext(WorkerContext);

const WorkerProvider = ({ children }: { children: ReactNode }) => {
  return <WorkerContext.Provider value={instance}>{children}</WorkerContext.Provider>;
};

export default WorkerProvider;
