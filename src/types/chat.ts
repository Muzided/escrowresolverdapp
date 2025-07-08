export interface startChatRequest {
  otherUserId: string;
}

export interface ConversationResponse {
  _id: string;
  participants: string[];
  disputeId: string;
  createdAt: string;
  __v: number;
}

export interface startConversationRequest {
  disputeContractAddress: string;
  target_walletaddress: string;
}
export interface ConversationType {
  userType: string;
  userWalletAddress: string;
  disputeContractAddress: string;
}

export interface Message {
  conversationId: string;
  message: string | null;
  senderId: string;
  media: Media | null
}

export interface UseSocketChatProps {
  conversationId: string;
  senderId: string;
  onMessageReceived?: (message: ChatMessage) => void;
}

export interface UseSocketChatReturn {
  sendMessage: (message: string | null, media: Media | null) => void;
  isConnected: boolean;
  error: string | null;
}

export interface ChatResponse {
  success: boolean;
  messages: ChatMessage[];
  pagination: ChatPagination;
}
export interface ChatSender {
  _id: string;
  wallet_address: string;
}
export interface ChatPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface ChatMessage {
  message_id: string;
  conversationId: string;
  sender: ChatSender;
  media: Media | null,
  content: string;
  sentAt: string;
}

export interface UploadMediaResponse {
  media: Media
}

export interface Media {

  url: string,
  type: string,
  originalName: string

}

export interface ChatBoxProps {
  setOpenChatBox: (val: boolean) => void;
  conversationType: ConversationType;
  conversationId: string | null;
  setConversationType: (val: ConversationType) => void;
  setConversationId: (val: string | null) => void;
}

export interface ChatHeaderProps {
  onGoBack: () => void;
  creatorAddress: string;
}

export interface ChatTabProps {
  messages: ChatMessage[];
  messagePagination: ChatPagination;
  conversationId: string;
  senderId: string;
  onLoadMore: (conversationId: string, page: number) => Promise<boolean>;
}

export interface MessageListProps {
  messages: ChatMessage[];
  senderId: string;
  isLoadingMore: boolean;
  messagePagination: ChatPagination;
  onLoadMore: (pagination: number) => Promise<void>;
}

export interface MessageInputProps {
  onSendMessage: (message: string, media?: Media | null) => void;
  isConnected: boolean;
  conversationId: string;
}

export interface MediaPreviewProps {
  media: Media;
  onRemove: () => void;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export interface MediaTabProps {
  conversationId: string;
}

export interface LoadingSpinnerProps {
  message?: string;
}