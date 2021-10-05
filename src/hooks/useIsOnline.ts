import { useState, useEffect } from 'react';

const useIsOnline = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator?.onLine === 'boolean' ? navigator.onLine : true;
  });

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener('online', online);
    window.addEventListener('offline', offline);

    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  return isOnline;
};

export default useIsOnline;
