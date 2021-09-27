import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { set } from 'schemas/set';

import { useWorker } from 'worker/WorkerContext';

const Set = () => {
  const { setId } = useParams();
  const worker = useWorker();

  const [setInfo, setSetInfo] = useState<set>({});
  console.log('setInfo', setInfo);

  useEffect(() => {
    if (setId) {
      worker.getSetById(setId).then((s: set) => setSetInfo(s));
    }
  }, [setId]);

  return <div></div>;
};

export default Set;
