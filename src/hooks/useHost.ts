import { useChat } from './useChat';

const useHost = () => {
  const { localConnectionDescription, setRemoteConnectionDescription, sendTextChatMessage } =
    useChat();
  return '';
};

export default useHost;
