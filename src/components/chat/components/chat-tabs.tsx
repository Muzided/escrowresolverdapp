import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import React from 'react';
import { ChatTab } from './chat-tab';
import { MediaTab } from './media/media-tab';
import { ChatTabProps } from '@/types/chat';

interface ChatTabsProps extends ChatTabProps {
  // Additional props specific to ChatTabs if needed
}

export const ChatTabs: React.FC<ChatTabsProps> = (props) => {
  return (
    <Tabs defaultValue="chat" className="flex-1">
      <TabsList className="w-full justify-start border-b border-zinc-200 dark:border-zinc-700">
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="flex-1 flex flex-col h-[450px]">
        <ChatTab {...props} />
      </TabsContent>

      <TabsContent value="media">
        <MediaTab conversationId={props.conversationId} />
      </TabsContent>
    </Tabs>
  );
};
