import { useCallback } from 'react';
import shortid from 'shortid';

import { usePeerConnection, usePeerConnectionSubscription } from 'comms/PeerConnection';
import { useChatMessages } from 'comms/ChatMessages';

import { MessageType, MessageTextType } from 'comms/types/MessageType';
import { MESSAGE_SENDER } from 'comms/types/MessageSenderEnum';
import { MESSAGE_TYPE } from 'comms/types/MessageTypeEnum';

export const useChat = () => {
  const { chatMessages, sendChatMessage } = useChatMessages();

  const {
    mode,
    isConnected,
    localConnectionDescription,
    startAsHost,
    startAsVisitor,
    setRemoteConnectionDescription,
    sendMessage,
  } = usePeerConnection();

  const sendTextChatMessage = useCallback(
    (messageText: string) => {
      const message: MessageTextType = {
        id: shortid.generate(),
        sender: MESSAGE_SENDER.VISITOR,
        type: MESSAGE_TYPE.TEXT,
        timestamp: +new Date(),
        payload: messageText,
      };

      sendMessage(message);
      sendChatMessage({
        id: message.id,
        sender: MESSAGE_SENDER.ME,
        timestamp: message.timestamp,
        text: message.payload,
      });
    },
    [sendMessage, sendChatMessage]
  );

  return {
    mode,
    isConnected,
    localConnectionDescription,
    chatMessages,
    startAsHost,
    startAsVisitor,
    setRemoteConnectionDescription,
    sendTextChatMessage,
  };
};

export const useChatPeerConnectionSubscription = () => {
  const { sendChatMessage } = useChatMessages();

  const onMessageReceived = useCallback(
    (message: MessageType) => {
      console.log(message);
      switch (message.type) {
        case MESSAGE_TYPE.TEXT:
          return sendChatMessage({
            id: message.id,
            sender: MESSAGE_SENDER.VISITOR,
            timestamp: message.timestamp,
            text: message.payload,
          });
        default:
          return;
      }
    },
    [sendChatMessage]
  );

  usePeerConnectionSubscription(onMessageReceived);
};
