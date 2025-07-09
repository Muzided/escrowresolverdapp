import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { MediaTab } from './media/media-tab';
import { ChatMessage, ChatPagination, Media } from '@/types/chat';
import { useSocketChat } from '@/Hooks/useSocketChat';

interface ChatTabsProps {
  messages: ChatMessage[];
  messagePagination: ChatPagination;
  conversationId: string;
  senderId: string;
  onLoadMore: (conversationId: string, page: number) => Promise<boolean>;
}

export const ChatTabs: React.FC<ChatTabsProps> = ({
  messages,
  messagePagination,
  conversationId,
  senderId,
  onLoadMore
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
    <Tabs defaultValue="chat" className="flex-1">
      <TabsList className="w-full justify-start border-b border-zinc-200 dark:border-zinc-700 ">
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="flex-1 flex flex-col h-[450px]">
        <div className="flex flex-col h-[500px]">
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
      </TabsContent>

      <TabsContent value="media">
        <MediaTab conversationId={conversationId} />
      </TabsContent>
    </Tabs>
  );
};
