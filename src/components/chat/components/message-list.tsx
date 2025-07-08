import { MessageListProps } from '@/types/chat';
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { MessageBubble } from './message-bubble';


export const MessageList = React.memo<MessageListProps>(({ 
  messages, 
  senderId, 
  isLoadingMore, 
  messagePagination, 
  onLoadMore 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) =>
      new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  }, [messages]);

  useEffect(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [sortedMessages, shouldScrollToBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && prevScrollHeight > 0) {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeight;
      container.scrollTop = container.scrollTop + scrollDiff;
      setPrevScrollHeight(0);
    }
  }, [sortedMessages, prevScrollHeight]);

  const handleScroll = useCallback(async () => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingMore || messagePagination.page === messagePagination.totalPages) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldScrollToBottom(isNearBottom);

    if (scrollTop < 100) {
      try {
        setPrevScrollHeight(scrollHeight);
        await onLoadMore(messagePagination.page + 1);
      } catch (error) {
        console.error('Error loading more messages:', error);
        setPrevScrollHeight(0);
      }
    }
  }, [isLoadingMore, onLoadMore, messagePagination]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    container.addEventListener('scroll', throttledHandleScroll);
    return () => {
      container.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-sm text-gray-500">Loading older messages...</span>
        </div>
      )}
      
      {!isLoadingMore && sortedMessages.length > 0 && messagePagination.page <= messagePagination.totalPages && (
        <div className="flex justify-center py-2">
          <button
            onClick={() => onLoadMore(messagePagination.page + 1)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Load older messages
          </button>
        </div>
      )}
      
      {sortedMessages.map((msg) => (
        <MessageBubble
          key={msg.message_id}
          message={msg}
          isOwn={msg.sender._id === senderId}
        />
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
});

MessageList.displayName = 'MessageList';