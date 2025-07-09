import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Paperclip } from 'lucide-react';
import { getConversationMedia } from '@/services/Api/chat/chat';
import { ConversationMessage, ConversationMessagesResponse } from '@/types/conversation';
import { useUser } from '@/context/userContext';
import { MediaTabProps } from '@/types/chat';

export const MediaTab: React.FC<MediaTabProps> = ({ conversationId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);
  const { user } = useUser();
  const [mediaMessages, setMediaMessages] = useState<ConversationMessage[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: chatMedia, isLoading, error } = useQuery<ConversationMessagesResponse | undefined>({
    queryKey: ['chat-media', conversationId, currentPage, pageSize],
    queryFn: async () => {
      const response = await getConversationMedia(conversationId, currentPage, pageSize);
      return response.data;
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (chatMedia && Array.isArray(chatMedia.messages)) {
      if (currentPage === 1) {
        setMediaMessages(chatMedia.messages);
      } else {
        setMediaMessages((prev) => [...chatMedia.messages, ...prev]);
      }
    }
  }, [chatMedia, currentPage]);

  const handleScroll = useCallback(async () => {
    const container = containerRef.current;
    if (!container || isLoadingMore || !chatMedia || !chatMedia.pagination) return;
    
    if (container.scrollTop < 100 && chatMedia.pagination.page < chatMedia.pagination.totalPages) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
      setTimeout(() => setIsLoadingMore(false), 500);
    }
  }, [isLoadingMore, chatMedia]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="flex-1 p-4">
      <div
        ref={containerRef}
        className="h-[450px] overflow-y-auto grid grid-cols-2 gap-4 pr-2"
      >
        {isLoadingMore && (
          <div className="col-span-2 flex justify-center py-2 text-xs text-gray-500">
            Loading more media...
          </div>
        )}
        
        {mediaMessages.map((data) => {
          const isMine = data.sender?._id === user?.id;
          return (
            <div
              key={data.message_id}
              className={`border rounded-lg p-3 flex flex-col gap-2 ${
                isMine
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                <div>
                  <p className="text-sm font-medium break-all">
                    {data.media.originalName || data.media.url}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(data.sentAt).toLocaleDateString()}{' '}
                    {isMine && <span className="ml-1 text-blue-500">(You)</span>}
                  </p>
                </div>
              </div>
              <a
                href={`https://escrow.ipcre8.com${data.media.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline"
              >
                View / Download
              </a>
            </div>
          );
        })}
        
        {mediaMessages.length === 0 && !isLoading && (
          <div className="col-span-2 flex justify-center items-center h-full text-zinc-500">
            No media files yet.
          </div>
        )}
      </div>
    </div>
  );
};