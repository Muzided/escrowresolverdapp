import { useState, useEffect, useRef } from 'react';
import { getChatMessages, startConversation } from '@/services/Api/chat/chat';
import { startConversationRequest, ConversationType, ChatMessage, ChatPagination } from '@/types/chat';

export const useConversationInitializer = (
  conversationId: string | null,
  conversationType: ConversationType,
  setConversationId: (id: string | null) => void
) => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagePagination, setMessagePagination] = useState<ChatPagination>({
    total: 0,
    page: 1,
    limit: 0,
    totalPages: 0
  });
  console.log("usertyupe", conversationType);
  // Use ref to track initialization to prevent multiple calls
  const isInitializing = useRef(false);
  const hasInitialized = useRef(false);

  const handleStartConversation = async () => {
    if (isInitializing.current) return; // Prevent concurrent calls
    
    try {
      isInitializing.current = true;
      const startConvoRequest: startConversationRequest = {
        disputeContractAddress: conversationType.disputeContractAddress,
        target_walletaddress: conversationType.userWalletAddress
      };
      const response = await startConversation(startConvoRequest);
      if (response.status === 201 || response.status === 200) {
        console.log("response from starting conversation in hook", response);
        setConversationId(response.data._id);
        hasInitialized.current = true;
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("error while starting conversation", error);
    } finally {
      isInitializing.current = false;
    }
  };

  useEffect(() => {
    const initializeConversation = async () => {
      // If already initialized or initializing, return early
      if (hasInitialized.current || isInitializing.current) return;
      
      if (!conversationId && conversationType.disputeContractAddress) {
        await handleStartConversation();
      } else if (conversationId) {
        try {
          const messagesResponse = await getChatMessages(conversationId);
          if (messagesResponse.status === 200 && messagesResponse.data) {
            setMessages(messagesResponse.data.messages);
            setMessagePagination(messagesResponse.data.pagination);
          }
          hasInitialized.current = true;
          setLoading(false);
        } catch (error) {
          console.log("error while fetching messages", error);
          setLoading(false);
        }
      }
    };

    initializeConversation();
  }, [conversationId, conversationType.disputeContractAddress, conversationType.userWalletAddress]);

  // Reset initialization state when conversation type changes significantly
  useEffect(() => {
    hasInitialized.current = false;
    isInitializing.current = false;
  }, [conversationType.disputeContractAddress]);

  return {
    loading,
    messages,
    messagePagination,
    setMessages,
    setMessagePagination
  };
};