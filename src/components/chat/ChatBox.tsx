import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ChevronLeft, Paperclip, Send, X } from "lucide-react"
import { getChatMessages, getConversationMedia, startConversation, uploadMediatoChat } from '@/services/Api/chat/chat'
import { startConversationRequest, ConversationType, Message, ChatMessage, ChatPagination, Media } from '@/types/chat'
import { useSocketChat } from '@/Hooks/useSocketChat'
import { useUser } from '@/context/userContext'
import { toast } from 'react-toastify'
import { useQuery } from '@tanstack/react-query'
import { ConversationMessagesResponse, ConversationMessage } from '@/types/conversation'
//684aa8e969a4d8abc595f0dd 

// Dummy data for chat
const dummyChatData = {
  participants: {
    creator: "0x1234...5678",
    receiver: "0x8765...4321",
    resolver: "0x2468...1357"
  },
  messages: [
    {
      id: 1,
      sender: "0x1234...5678",
      content: "Hello, I have a question about the escrow payment.",
      timestamp: "2024-03-15T10:00:00Z",
      type: "text"
    },
    {
      id: 2,
      sender: "0x8765...4321",
      content: "Sure, what would you like to know?",
      timestamp: "2024-03-15T10:05:00Z",
      type: "text"
    },
    {
      id: 3,
      sender: "0x1234...5678",
      content: "contract.pdf",
      timestamp: "2024-03-15T10:10:00Z",
      type: "document",
      fileType: "pdf",
      fileSize: "2.5MB"
    },
    {
      id: 4,
      sender: "0x2468...1357",
      content: "I've reviewed the contract. Let me know if you need any clarification.",
      timestamp: "2024-03-15T10:15:00Z",
      type: "text"
    },
    {
      id: 5,
      sender: "0x8765...4321",
      content: "screenshot.png",
      timestamp: "2024-03-15T10:20:00Z",
      type: "image",
      fileType: "png",
      fileSize: "1.2MB"
    }
  ]
}
type Props = {
  setOpenChatBox: (val: boolean) => void;
  conversationType: ConversationType;
  conversationId: string | null;
  setConversationType: (val: ConversationType) => void;
  setConversationId: (val: string | null) => void;
};
const ChatBox: React.FC<Props> = ({ setOpenChatBox, conversationType, conversationId, setConversationType, setConversationId }) => {

  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [messagePagination, setMessagePagination] = useState<ChatPagination>({
    total: 0,
    page: 1,
    limit: 0,
    totalPages: 0
  })
  const { user } = useUser()

  useEffect(() => {
    const initializeConversation = async () => {
      if (!conversationId && !isInitialized && conversationType.disputeContractAddress) {
        console.log("checking conversations", conversationId, conversationType)
        setIsInitialized(true)
        await handleStartConversation()
      } else if (conversationId) {
        const messagesResponse = await getChatMessages(conversationId)
        if (messagesResponse.status === 200 && messagesResponse.data) {
          setMessages(messagesResponse.data.messages)
          setMessagePagination(messagesResponse.data.pagination)
        }
        setLoading(false)
      }
    }

    initializeConversation()
  }, [conversationId, conversationType.disputeContractAddress])

  const handleStartConversation = async () => {
    try {
      const startConvoRequest: startConversationRequest = {
        disputeContractAddress: conversationType.disputeContractAddress,
        target_walletaddress: conversationType.userWalletAddress
      }
      const response = await startConversation(startConvoRequest)
      if (response.status === 201 || response.status === 200) {
        setConversationId(response.data._id)
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      console.log("error while starting conversation", error)
    }
  }


  console.log("user", user)
  const goBack = () => {
    setOpenChatBox(false)
    setLoading(true)
    setConversationType({ userType: "", userWalletAddress: "", disputeContractAddress: "" })
    setConversationId(null)
    setIsInitialized(false)
  }
  const handleLoadMoreMessages = async (conversationId: string, page: number) => {
    try {
      const response = await getChatMessages(conversationId, page)
      if (response.status === 200 && response.data) {
        setMessagePagination(response.data.pagination)
        setMessages(prev => [...prev || [], ...response.data.messages])
        return response.data.messages.length > 0
      }
      return false
    } catch (error) {
      console.error('Error loading more messages:', error)
      toast.error('Failed to load more messages')
      return false
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col p-6 bg-white dark:bg-zinc-900 rounded-lg shadow">
        <div className="flex items-center justify-center h-[450px]">
          <div className="text-zinc-500">Loading conversation...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col  p-6 bg-white dark:bg-zinc-900 rounded-lg shadow">
      {/* Header with participant info */}
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">

        <div
          onClick={goBack}
          className="text-lg cursor-pointer font-semibold text-zinc-900 dark:text-white flex items-center gap-2 "> <ChevronLeft className="w-4 h-4" /> Back</div>
        <div className="flex gap-4 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          <div>
            <span className="font-medium">Creator:</span> {dummyChatData.participants.creator}
          </div>

        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="chat" className="flex-1">
        <TabsList className="w-full justify-start border-b border-zinc-200 dark:border-zinc-700">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col h-[450px]">
          {/* Messages */}
          <ChatTab
            messages={messages}
            messagePagination={messagePagination}
            conversationId={conversationId || ""}
            senderId={user?.id || ""}
            onLoadMore={handleLoadMoreMessages}
          />
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" >
          <MediaTab conversationId={conversationId || ""} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ChatBox

interface ChatTabProps {
  messages: ChatMessage[];
  messagePagination: ChatPagination;
  conversationId: string;
  senderId: string;
  onLoadMore: (conversationId: string, page: number) => Promise<boolean>
}

// Separate Message List Component
const MessageList = React.memo(({ messages, senderId, isLoadingMore, messagePagination, onLoadMore }: { messages: ChatMessage[], senderId: string, isLoadingMore: boolean, messagePagination: ChatPagination, onLoadMore: (pagination: number) => Promise<void>, }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [prevScrollHeight, setPrevScrollHeight] = useState(0)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)
  // Sort messages by sentAt timestamp
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

  // Maintain scroll position when loading older messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && prevScrollHeight > 0) {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeight;
      container.scrollTop = container.scrollTop + scrollDiff;
      setPrevScrollHeight(0); // Reset
    }
  }, [sortedMessages, prevScrollHeight]);

  // Handle scroll to load more messages
  const handleScroll = useCallback(async () => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingMore || messagePagination.page === messagePagination.totalPages) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Check if user is near bottom (within 100px) to enable auto-scroll for new messages
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldScrollToBottom(isNearBottom);

    // Check if we're near the top (within 100px) to load more messages
    if (scrollTop < 100) {
      console.log('Loading more messages...', {
        scrollTop,
        currentPage: messagePagination.page,
        hasMore: messagePagination.page < messagePagination.totalPages
      });

      try {
        // Store current scroll height before loading
        setPrevScrollHeight(scrollHeight);
        await onLoadMore(messagePagination.page + 1);
      } catch (error) {
        console.error('Error loading more messages:', error);
        setPrevScrollHeight(0); // Reset on error
      }
    }
  }, [isLoadingMore, onLoadMore, messagePagination]);
  // Add scroll event listener with throttling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100); // Throttle to 100ms
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
  console.log("sorted-messages", sortedMessages)
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
      {sortedMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-zinc-500">
          No messages yet. Start the conversation!
        </div>
      )
        :
        (
          sortedMessages.map((msg) => (
            <div
              key={msg.message_id}
              className={`flex ${msg.sender._id === senderId
                ? "justify-end"
                : "justify-start"
                }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${msg.sender._id === senderId
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  }`}
              >
                {/* Show message content only if it's not empty */}
                {msg.content && msg.content.trim() !== "" && (
                  <p>{msg.content}</p>
                )}

                {/* Show media if it exists */}
                {msg.media?.url && (
                  <div className="mt-2">
                    {/* Show image preview for image types */}

                    {msg.media?.type === 'image' ? (
                      <div className="mb-2">
                        <img
                          src={`http://localhost:5000${msg?.media?.url}`}
                          alt={msg.media.originalName || 'Image'}
                          className="max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                          onClick={() => window.open(`http://localhost:5000${msg?.media?.url}`, '_blank')}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-zinc-600 rounded-lg">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {msg.media.originalName || 'File'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {msg.media.type || 'File'}
                          </p>
                        </div>
                        <a
                          href={`http://localhost:5000${msg.media.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 text-sm"
                          download={msg.media.type !== 'application/pdf'}
                        >
                          {msg.media.type === 'application/pdf' ? 'View' : 'Download'}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-xs opacity-70 mt-1 block">
                  {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : ''}
                </span>
              </div>
            </div>
          ))
        )}
      <div ref={messagesEndRef} />
    </div>
  );
});

MessageList.displayName = 'MessageList';

// Separate Message Input Component
const MessageInput = React.memo(({
  onSendMessage,
  isConnected
}: {
  onSendMessage: (message: string) => void,
  isConnected: boolean
}) => {
  const [message, setMessage] = useState("");

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  }, [message, onSendMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }, [handleSend]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File uploaded:", file);
    }
  }, []);

  return (
    <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button variant="outline" size="icon">
            <Paperclip className="w-4 h-4" />
          </Button>
        </label>
        <Button
          onClick={handleSend}
          disabled={!isConnected || !message.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

const ChatTab: React.FC<ChatTabProps> = ({ messages, messagePagination, onLoadMore, conversationId, senderId }) => {
  const [message, setMessage] = useState("")
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [media, setMedia] = useState<Media | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const handleMessageReceived = useCallback((message: ChatMessage) => {

    // Add the new message to allMessages array, avoiding duplicates
    setAllMessages(prev => {
      const exists = prev.some(msg => msg.message_id === message.message_id)
      if (exists) return prev
      return [...prev, message]
    })
  }, [])

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
      setAllMessages(messages)
    }
  }, [messages])

  const handleSendMessage = () => {
    if ((!message.trim() && !media) || !conversationId) return;

    // Send message with media if available
    if (media && message) {
      console.log("media-being-sent", media)
      // You can modify this to send both text and media
      socketSendMessage(message, media);
      // socketSendMessage(message, media) // If your socket supports media
    } else if (media && !message) {
      console.log("message", message)
      socketSendMessage('', media);
    } else if (message && !media) {
      socketSendMessage(message, null);
    }

    setMessage("");
    setMedia(null); // Clear media after sending
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && conversationId) {
      try {
        console.log("File uploaded:", file)
        const response = await uploadMediatoChat(file)
        console.log("response", response)
        if (response.status === 200) {
          setMedia(response.data.media)
          toast.success("File uploaded successfully")
        } else {
          toast.error("Failed to upload file")
        }
      } catch (error) {
        console.error("Error uploading file:", error)
        toast.error("Failed to upload file")
      }
    }
    // Reset the input
    event.target.value = ''
  }

  const handleRemoveMedia = () => {
    setMedia(null)
  }
  
  const handleScroll = async (pagination: number) => {
    console.log("message-pagination", messagePagination, pagination)
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
  }
  return (
    <div className="flex flex-col   h-[450px]">
      <MessageList
        messages={allMessages}
        senderId={senderId}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleScroll}
        messagePagination={messagePagination}
      />
      {/* <MessageInput onSendMessage={handleSendMessage} isConnected={isConnected} /> */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
        {/* Media Preview */}
        {media && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
                  <Paperclip className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {media.originalName || 'Uploaded file'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {media.type || 'File uploaded'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveMedia}
                className="h-8 w-8 text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={media ? "Add a message (optional)..." : "Type a message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <label className="cursor-pointer">
            <>
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
            </>
          </label>
          <Button
            onClick={handleSendMessage}
            disabled={!isConnected || (!message.trim() && !media)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
interface MediaProps {
  conversationId: string
}
const MediaTab = ({ conversationId }: MediaProps) => {
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

  // Append new media messages when page changes
  useEffect(() => {
    if (chatMedia && Array.isArray(chatMedia.messages)) {
      if (currentPage === 1) {
        setMediaMessages(chatMedia.messages);
      } else {
        setMediaMessages((prev) => [...chatMedia.messages, ...prev]);
      }
    }
  }, [chatMedia, currentPage]);

  // Scroll handler for pagination
  const handleScroll = useCallback(async () => {
    const container = containerRef.current;
    if (!container || isLoadingMore || !chatMedia || !chatMedia.pagination) return;
    if (container.scrollTop < 100 && chatMedia.pagination.page < chatMedia.pagination.totalPages) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
      setTimeout(() => setIsLoadingMore(false), 500); // Simulate loading
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
        style={{ position: 'relative' }}
      >
        {isLoadingMore && (
          <div className="col-span-2 flex justify-center py-2 text-xs text-gray-500">Loading more media...</div>
        )}
        {mediaMessages.map((data) => {
          const isMine = data.sender?._id === user?.id;
          return (
            <div
              key={data.message_id}
              className={`border rounded-lg p-3 flex flex-col gap-2 ${isMine
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30' // mine
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800' // others
                }`}
              style={{ alignSelf: isMine ? 'end' : 'start' }}
            >
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                <div>
                  <p className="text-sm font-medium break-all">
                    {data.media.originalName || data.media.url}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(data.sentAt).toLocaleDateString()} {isMine && <span className="ml-1 text-blue-500">(You)</span>}
                  </p>
                </div>
              </div>
              <a
                href={`http://localhost:5000${data.media.url}`}
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
}

