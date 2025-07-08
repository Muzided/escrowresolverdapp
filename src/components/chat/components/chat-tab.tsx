import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { ChatMessage, ChatTabProps, Media } from '@/types/chat';
import { useSocketChat } from '@/Hooks/useSocketChat';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

export const ChatTab: React.FC<ChatTabProps> = ({ 
  messages, 
  messagePagination, 
  onLoadMore, 
  conversationId, 
  senderId 
}) => {
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleMessageReceived = useCallback((message: ChatMessage) => {
    setAllMessages(prev => {
      const exists = prev.some(msg => msg.message_id === message.message_id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const {
    sendMessage: socketSendMessage,
    isConnected,
    error: socketError
  } = useSocketChat({
    conversationId: conversationId,
    senderId: senderId,
    onMessageReceived: handleMessageReceived,
  });

  useEffect(() => {
    if (messages.length > 0) {
      setAllMessages(messages);
    }
  }, [messages]);

  const handleSendMessage = useCallback((message: string, media: Media | null = null) => {
    if ((!message.trim() && !media) || !conversationId) return;

    if (media && message) {
      socketSendMessage(message, media);
    } else if (media && !message) {
      socketSendMessage('', media);
    } else if (message && !media) {
      socketSendMessage(message, null);
    }
  }, [conversationId, socketSendMessage]);

  const handleLoadMore = useCallback(async (pagination: number) => {
    if (messagePagination.page >= messagePagination.totalPages) {
      setIsLoadingMore(false);
      return;
    }

    setIsLoadingMore(true);
    try {
      await onLoadMore(conversationId, pagination);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, messagePagination, onLoadMore]);

  return (
    <div className="flex flex-col h-[450px]">
      <MessageList
        messages={allMessages}
        senderId={senderId}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        messagePagination={messagePagination}
      />
      <MessageInput
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
        conversationId={conversationId}
      />
    </div>
  );
};
