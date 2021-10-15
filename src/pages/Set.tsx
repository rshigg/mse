import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { CardSet } from 'schemas/set';

import { useWorker } from 'worker/WorkerContext';

const Set = () => {
  const { setId } = useParams();
  const worker = useWorker();

  const [setInfo, setSetInfo] = useState<CardSet | null>(null);
  console.log('setInfo', setInfo);

  useEffect(() => {
    if (setId) {
      worker.getSetById(setId).then((s) => setSetInfo(s));
      worker.getCardsBySetId(setId).then((cards) => console.log(cards));
    }
  }, [setId]);

  return <div></div>;
};

export default Set;
