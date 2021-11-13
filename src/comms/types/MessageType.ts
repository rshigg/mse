import { MESSAGE_SENDER } from './MessageSenderEnum';
import { MESSAGE_TYPE } from './MessageTypeEnum';
import { MessagePayloadType, MessagePayloadTextType } from './MessagePayloadType';

export type MessagePayload = MessagePayloadType;
export type Message = {
  id: string;
  sender: MESSAGE_SENDER;
  type: MESSAGE_TYPE;
  timestamp: number;
  payload: MessagePayload;
};
export type MessageTextType = Message & {
  type: MESSAGE_TYPE.TEXT;
  payload: MessagePayloadTextType;
};

export type MessageType = MessageTextType;
