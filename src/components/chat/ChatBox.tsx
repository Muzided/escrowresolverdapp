import React from 'react';
import { getChatMessages } from '@/services/Api/chat/chat';
import { ConversationType, ChatPagination, ChatBoxProps } from '@/types/chat';
import { useUser } from '@/context/userContext';
import { toast } from 'react-toastify';
import { ChatHeader } from './components/chat-header';
import { ChatTabs } from './components/chat-tabs';
import { useConversationInitializer } from '@/Hooks/useConversationInitializer';
import { LoadingSpinner } from './components/loading-spinner';

// Dummy data for header - you might want to fetch this from props or context
const dummyChatData = {
  participants: {
    creator: "0x1234...5678",
    receiver: "0x8765...4321",
    resolver: "0x2468...1357"
  }
};

const ChatBox: React.FC<ChatBoxProps> = ({ 
  setOpenChatBox, 
  conversationType, 
  conversationId, 
  setConversationType, 
  setConversationId 
}) => {
  const { user } = useUser();
  
  const {
    loading,
    messages,
    messagePagination,
    setMessages,
    setMessagePagination
  } = useConversationInitializer(conversationId, conversationType, setConversationId);

  const handleLoadMoreMessages = async (conversationId: string, page: number) => {
    try {
      const response = await getChatMessages(conversationId, page);
      if (response.status === 200 && response.data) {
        setMessagePagination(response.data.pagination);
        setMessages(prev => [...prev || [], ...response.data.messages]);
        return response.data.messages.length > 0;
      }
      return false;
    } catch (error) {
      console.error('Error loading more messages:', error);
      toast.error('Failed to load more messages');
      return false;
    }
  };

  const handleGoBack = () => {
    setOpenChatBox(false);
    setConversationType({ userType: "", userWalletAddress: "", disputeContractAddress: "" });
    setConversationId(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col h-full  p-6 bg-white dark:bg-zinc-900 rounded-lg shadow">
      <ChatHeader 
        onGoBack={handleGoBack}
        creatorAddress={dummyChatData.participants.creator}
      />
      
      <ChatTabs
        messages={messages}
        messagePagination={messagePagination}
        conversationId={conversationId || ""}
        senderId={user?.id || ""}
        onLoadMore={handleLoadMoreMessages}
      />
    </div>
  );
};

export default ChatBox;