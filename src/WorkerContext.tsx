import React, { createContext, useContext, useEffect, ReactChild } from 'react';
import { wrap } from 'comlink/dist/esm/comlink';

// @ts-ignore
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread.js';
import MainWorker from './main.worker?worker';

import { logWorkerMessage } from './utils';

const worker: Worker = new MainWorker();
const instance = wrap<import('./main.worker').MainWorker>(worker);
initBackend(worker);

const WorkerContext = createContext(instance);
export const useWorker = () => useContext(WorkerContext);

type WorkerProviderProps = {
  children: ReactChild;
};

const pm = (type: String, data?: Object) => {
  worker.postMessage({ type, ...data });
};

const WorkerProvider = ({ children }: WorkerProviderProps) => {
  useEffect(() => {
    instance.getAllSets().then((sets) => {
      console.log(sets);
    });

    //   pm('init');

    //   const handleMessage = (msg: MessageEvent) => {
    //     logWorkerMessage(msg);
    //     switch (msg.data.type) {
    //       case 'init':
    //         console.log(msg.data.sets);
    //         break;
    //       case 'set':
    //         console.log(msg.data.set);
    //         break;
    //     }
    //   };

    //   worker.addEventListener('message', handleMessage);

    //   return () => worker.removeEventListener('message', handleMessage);
  }, []);

  return <WorkerContext.Provider value={instance}>{children}</WorkerContext.Provider>;
};

export default WorkerProvider;
