import React from 'react';
import { Paperclip } from 'lucide-react';
import { MessageBubbleProps } from '@/types/chat';

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwn
            ? "bg-blue-500 text-white"
            : "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
        }`}
      >
        {/* Message content */}
        {message.content && message.content.trim() !== "" && (
          <p>{message.content}</p>
        )}
              

        {/* Media content */}
        {message.media?.url && (
          <div className="mt-2">
            {message.media?.type === 'image' ? (
              <div className="mb-2">
                <img
                  src={`http://localhost:5000${message?.media?.url}`}
                  alt={message.media.originalName || 'Image'}
                  className="max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                  onClick={() => window.open(`http://localhost:5000${message?.media?.url}`, '_blank')}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-zinc-600 rounded-lg">
                <Paperclip className="w-4 h-4 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {message.media.originalName || 'File'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {message.media.type || 'File'}
                  </p>
                </div>
                <a
                  href={`http://localhost:5000${message.media.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 text-sm"
                  download={message.media.type !== 'application/pdf'}
                >
                  {message.media.type === 'application/pdf' ? 'View' : 'Download'}
                </a>
              </div>
            )}
          </div>
        )}

        <span className="text-xs opacity-70 mt-1 block">
          {message.sentAt ? new Date(message.sentAt).toLocaleTimeString() : ''}
        </span>
      </div>
    </div>
  );
};
