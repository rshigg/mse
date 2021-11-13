import React, {
  createContext,
  FC,
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { Subject } from 'rxjs';
import { Base64 } from 'js-base64';
import { z } from 'zod';

import { generateKey, decrypt, encrypt } from 'comms/utils/encryption';
import { createPeerConnection, CreatePeerConnectionResponse } from 'comms/createPeerConnection';

export const ConnectionDescriptionValidator = z.object({
  description: z.string(),
  encryptionKey: z.string(),
});

export type ConnectionDescription = z.infer<typeof ConnectionDescriptionValidator>;

export enum PEER_CONNECTION_MODE {
  HOST = 'HOST',
  VISITOR = 'VISITOR',
}

const iceServers: RTCIceServer[] = [
  {
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302',
    ],
  },
  {
    urls: 'turn:numb.viagenie.ca',
    credential: 'muazkh',
    username: 'webrtc@live.com',
  },
];

const peerConnectionSubject = new Subject<any>();

interface PeerConnectionContextValue {
  mode: PEER_CONNECTION_MODE | undefined;
  isConnected: boolean;
  localConnectionDescription: ConnectionDescription | undefined;
  startAsHost: () => void;
  startAsVisitor: (connectionDescription: ConnectionDescription) => void;
  setRemoteConnectionDescription: (connectionDescription: ConnectionDescription) => void;
  sendMessage: (message: any) => void;
  peerConnectionSubject: typeof peerConnectionSubject;
}

const PeerConnectionContext = createContext<PeerConnectionContextValue>(
  {} as PeerConnectionContextValue
);

export const PeerConnectionProvider: FC = ({ children }) => {
  const [mode, setMode] = useState<PEER_CONNECTION_MODE | undefined>(undefined);
  const encryptionKeyRef = useRef(generateKey());
  const [localDescription, setLocalDescription] = useState<string | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const peerConnectionRef = useRef<CreatePeerConnectionResponse>();

  const onChannelOpen = useCallback(() => setIsConnected(true), [setIsConnected]);

  const onMessageReceived = useCallback((messageString: string) => {
    try {
      const decryptedMessageString = decrypt(messageString, encryptionKeyRef.current);
      const message = JSON.parse(decryptedMessageString);
      console.log('message', message);
      peerConnectionSubject.next(message);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const startAsHost = useCallback(async () => {
    if (typeof mode !== 'undefined') return;

    setMode(PEER_CONNECTION_MODE.HOST);
    peerConnectionRef.current = await createPeerConnection({
      iceServers,
      onMessageReceived,
      onChannelOpen,
    });

    setLocalDescription(Base64.encode(peerConnectionRef.current.localDescription));
  }, [mode, setMode, onMessageReceived, onChannelOpen, setLocalDescription]);

  const startAsVisitor = useCallback(
    async (connectionDescription: ConnectionDescription) => {
      if (typeof mode !== 'undefined') return;

      setMode(PEER_CONNECTION_MODE.VISITOR);
      encryptionKeyRef.current = connectionDescription.encryptionKey;

      peerConnectionRef.current = await createPeerConnection({
        iceServers,
        remoteDescription: Base64.decode(connectionDescription.description),
        onMessageReceived,
        onChannelOpen,
      });

      setLocalDescription(Base64.encode(peerConnectionRef.current.localDescription));
    },
    [mode, setMode, onMessageReceived, onChannelOpen, setLocalDescription]
  );

  const setRemoteConnectionDescription = useCallback(
    (connectionDescription: ConnectionDescription) => {
      if (!peerConnectionRef.current) return;

      peerConnectionRef.current.setAnswerDescription(
        Base64.decode(connectionDescription.description)
      );
    },
    []
  );

  const sendMessage = useCallback((message) => {
    if (!peerConnectionRef.current) return;

    const messageString = JSON.stringify(message);
    const encryptedMessageString = encrypt(messageString, encryptionKeyRef.current);

    peerConnectionRef.current.sendMessage(encryptedMessageString);
  }, []);

  const localConnectionDescription: ConnectionDescription | undefined = useMemo(
    () =>
      localDescription && encryptionKeyRef.current
        ? {
            description: localDescription,
            encryptionKey: encryptionKeyRef.current,
          }
        : undefined,
    [localDescription]
  );

  return (
    <PeerConnectionContext.Provider
      value={{
        mode,
        isConnected,
        localConnectionDescription,
        startAsHost,
        startAsVisitor,
        setRemoteConnectionDescription,
        sendMessage,
        peerConnectionSubject,
      }}
    >
      {children}
    </PeerConnectionContext.Provider>
  );
};

export const usePeerConnection = () => useContext(PeerConnectionContext);

export const usePeerConnectionSubscription = <T extends any>(
  onMessageReceived: (message: T) => void
) => {
  const { peerConnectionSubject } = useContext(PeerConnectionContext);

  useEffect(() => {
    const subscription = (peerConnectionSubject as Subject<T>).subscribe(onMessageReceived);

    return () => subscription.unsubscribe();
  }, [peerConnectionSubject, onMessageReceived]);
};
