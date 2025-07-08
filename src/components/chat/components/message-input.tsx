import React, { useState, useCallback } from 'react';
import { Paperclip, Send } from "lucide-react";
import { toast } from 'react-toastify';
import { uploadMediatoChat } from '@/services/Api/chat/chat';
import { Media, MessageInputProps } from '@/types/chat';
import { MediaPreview } from './media/media-preview';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isConnected,
  conversationId
}) => {
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState<Media | null>(null);

  const handleSend = useCallback(() => {
    if ((!message.trim() && !media) || !conversationId) return;
    onSendMessage(message, media);
    setMessage("");
    setMedia(null);
  }, [message, media, conversationId, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }, [handleSend]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && conversationId) {
      try {
        const response = await uploadMediatoChat(file);
        if (response.status === 200) {
          setMedia(response.data.media);
          toast.success("File uploaded successfully");
        } else {
          toast.error("Failed to upload file");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file");
      }
    }
    event.target.value = '';
  }, [conversationId]);

  const handleRemoveMedia = useCallback(() => {
    setMedia(null);
  }, []);

  return (
    <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
      {media && <MediaPreview media={media} onRemove={handleRemoveMedia} />}
      
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={media ? "Add a message (optional)..." : "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <label className="cursor-pointer">
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,image/*,application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain,.md,text/markdown,.csv,text/csv,.html,text/html,.htm,.xml,text/xml,application/rtf,.rtf,application/json,.json,application/xml,application/x-apple-pages,application/x-iwork-pages-sffpages"
          />
          <Button asChild variant="outline" size="icon">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Paperclip className="w-4 h-4" />
            </label>
          </Button>
        </label>
        <Button
          onClick={handleSend}
          disabled={!isConnected || (!message.trim() && !media)}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};