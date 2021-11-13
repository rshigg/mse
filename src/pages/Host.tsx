import React, { useEffect, useMemo } from 'react';
import useLocalStorage from 'react-use/esm/useLocalStorage';

import { useChat } from 'hooks/useChat';
import { decode, encode } from 'comms/utils/connectionDescriptionEncoding';
import { ConnectionDescription, ConnectionDescriptionValidator } from 'comms/PeerConnection';

const Host = () => {
  const chat = useChat();
  const { localConnectionDescription, setRemoteConnectionDescription, sendTextChatMessage } = chat;
  console.log('chat', chat);

  const [remoteDescription, setRemoteDescription, deleteDescription] =
    useLocalStorage<ConnectionDescription | null>('remote', null);

  useEffect(() => {
    if (remoteDescription) {
      setRemoteConnectionDescription(remoteDescription);
    }
  }, [remoteDescription]);

  useEffect(() => {
    try {
      sendTextChatMessage(`Connecting`);
    } catch {
      deleteDescription();
      chat.startAsHost();
    }
  }, []);

  const encodedDescription = useMemo(() => {
    return localConnectionDescription ? encode(localConnectionDescription) : '';
  }, [localConnectionDescription]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    try {
      const decoded = decode(value);
      ConnectionDescriptionValidator.parse(decoded);
      setRemoteDescription(decoded);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <h1>Host</h1>
      <h2>Local description</h2>
      <code>{encodedDescription}</code>
      {!remoteDescription && (
        <>
          <h2>Remote description</h2>
          <textarea onChange={onChange} style={{ resize: 'none' }} />
        </>
      )}
      <hr />
      <h2>Messages</h2>
      {JSON.stringify(chat.chatMessages)}
    </>
  );
};

export default Host;
