import React, { useEffect, useMemo } from 'react';
import useLocalStorage from 'react-use/esm/useLocalStorage';

import { useChat } from 'hooks/useChat';
import { decode, encode } from 'comms/utils/connectionDescriptionEncoding';
import { ConnectionDescription, ConnectionDescriptionValidator } from 'comms/PeerConnection';

const Visitor = () => {
  const chat = useChat();
  const { localConnectionDescription, startAsVisitor, isConnected, sendTextChatMessage } = chat;
  console.log('chat', chat);

  const [hostDescription, setHostDescription, deleteDescription] =
    useLocalStorage<ConnectionDescription | null>('host', null);
  console.log('hostDescription', hostDescription);

  useEffect(() => {
    if (hostDescription) {
      startAsVisitor(hostDescription);
    }
  }, [hostDescription]);

  useEffect(() => {
    if (isConnected) {
      sendTextChatMessage('Hello, I am a visitor!');
    }
  }, [isConnected]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    try {
      const decoded = decode(value);
      ConnectionDescriptionValidator.parse(decoded);
      setHostDescription(decoded);
    } catch (e) {
      console.error(e);
    }
  };

  const encodedDescription = useMemo(() => {
    return localConnectionDescription ? encode(localConnectionDescription) : '';
  }, [localConnectionDescription]);

  return (
    <>
      <h1>Visitor</h1>
      {!hostDescription && (
        <>
          <h2>Host description</h2>
          <textarea onChange={onChange} style={{ resize: 'none' }} />
        </>
      )}
      <h2>Local description</h2>
      <code>{encodedDescription}</code>
      <button onClick={deleteDescription}>Delte host description</button>
      <hr />
      <h2>Messages</h2>
      {JSON.stringify(chat.chatMessages)}
    </>
  );
};

export default Visitor;
