import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ChevronLeft, Paperclip, Send } from "lucide-react"

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
   
  };
const ChatBox:React.FC<Props>  = ({setOpenChatBox}) => {
  const [activeTab, setActiveTab] = useState("chat")
  const [message, setMessage] = useState("")

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage("")
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Handle file upload
      console.log("File uploaded:", file)
    }
  }

  return (
    <div className="flex flex-col  p-6 bg-white dark:bg-zinc-900 rounded-lg shadow">
      {/* Header with participant info */}
      <div className="p-2 border-b border-zinc-200 dark:border-zinc-700">
       
        <div 
        onClick={() => setOpenChatBox(false)}
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {dummyChatData.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === dummyChatData.participants.resolver
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender === dummyChatData.participants.resolver
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  }`}
                >
                  {msg.type === "text" ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      <span>{msg.content}</span>
                      <span className="text-xs opacity-70">({msg.fileSize})</span>
                    </div>
                  )}
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4">
            {dummyChatData.messages
              .filter((msg) => msg.type !== "text")
              .map((media) => (
                <div
                  key={media.id}
                  className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium">{media.content}</p>
                      <p className="text-xs text-zinc-500">
                        {media.fileSize} • {new Date(media.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ChatBox
