import { useState, useEffect } from 'react';
import { getChatMessages, startConversation } from '@/services/Api/chat/chat';
import { startConversationRequest, ConversationType, ChatMessage, ChatPagination } from '@/types/chat';

export const useConversationInitializer = (
  conversationId: string | null,
  conversationType: ConversationType,
  setConversationId: (id: string | null) => void
) => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [messagePagination, setMessagePagination] = useState<ChatPagination>({
    total: 0,
    page: 1,
    limit: 0,
    totalPages: 0
  });

  const handleStartConversation = async () => {
    try {
      const startConvoRequest: startConversationRequest = {
        disputeContractAddress: conversationType.disputeContractAddress,
        target_walletaddress: conversationType.userWalletAddress
      };
      const response = await startConversation(startConvoRequest);
      if (response.status === 201 || response.status === 200) {
        setConversationId(response.data._id);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("error while starting conversation", error);
    }
  };

  useEffect(() => {
    const initializeConversation = async () => {
      if (!conversationId && !isInitialized && conversationType.disputeContractAddress) {
        setIsInitialized(true);
        await handleStartConversation();
      } else if (conversationId) {
        const messagesResponse = await getChatMessages(conversationId);
        if (messagesResponse.status === 200 && messagesResponse.data) {
          setMessages(messagesResponse.data.messages);
          setMessagePagination(messagesResponse.data.pagination);
        }
        setLoading(false);
      }
    };

    initializeConversation();
  }, [conversationId, conversationType.disputeContractAddress]);

  return {
    loading,
    messages,
    messagePagination,
    setMessages,
    setMessagePagination
  };
};