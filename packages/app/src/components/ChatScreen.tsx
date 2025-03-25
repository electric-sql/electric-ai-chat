import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  Box,
  Flex,
  Text,
  Heading,
  TextField,
  IconButton,
  Card,
  Avatar,
  ScrollArea,
  Button
} from '@radix-ui/themes';
import { Send, Menu } from 'lucide-react';
import { Message, Chat, generateChatId, formatDate } from '../lib/utils';
import { toggleSidebar } from './Sidebar';

export default function ChatScreen() {
  const { chatId } = useParams({ from: '/chat/$chatId' });
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    // Load chat from localStorage
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const foundChat = chats.find((c: Chat) => c.id === chatId);
    
    if (foundChat) {
      // Convert string dates back to Date objects
      foundChat.createdAt = new Date(foundChat.createdAt);
      foundChat.updatedAt = new Date(foundChat.updatedAt);
      foundChat.messages.forEach((msg: Message) => {
        msg.timestamp = new Date(msg.timestamp);
      });
      setChat(foundChat);
    } else {
      // Chat not found, redirect to new chat
      navigate({ to: '/' });
    }

    // Add event listener for window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chatId, navigate]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !chat) return;
    
    // Add user message
    const newUserMessage: Message = {
      id: generateChatId(),
      content: message,
      sender: username,
      timestamp: new Date(),
      isAI: false
    };
    
    const updatedChat = {
      ...chat,
      messages: [...chat.messages, newUserMessage],
      updatedAt: new Date()
    };
    
    setChat(updatedChat);
    setMessage('');
    setIsLoading(true);
    
    // Update in localStorage
    updateChatInStorage(updatedChat);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: generateChatId(),
        content: `This is a simulated AI response to: "${newUserMessage.content}"`,
        sender: 'AI Assistant',
        timestamp: new Date(),
        isAI: true
      };
      
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
        updatedAt: new Date()
      };
      
      setChat(finalChat);
      setIsLoading(false);
      
      // Update in localStorage
      updateChatInStorage(finalChat);
    }, 1000);
  };
  
  const updateChatInStorage = (updatedChat: Chat) => {
    const chats = JSON.parse(localStorage.getItem('chats') || '[]');
    const updatedChats = chats.map((c: Chat) => 
      c.id === chatId ? updatedChat : c
    );
    localStorage.setItem('chats', JSON.stringify(updatedChats));
  };

  if (!chat) {
    return (
      <Flex 
        align="center" 
        justify="center" 
        style={{ height: '100%' }}
      >
        <Text color="gray" size="2">Loading chat...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" style={{ height: '100%', width: '100%' }}>
      {/* Header with title and sidebar toggle */}
      <Flex 
        align="center" 
        justify="between"
        style={{
          height: '56px',
          borderBottom: '1px solid var(--gray-5)',
          padding: '0 16px'
        }}
      >
        <Flex align="center" gap="2">
          {isMobile && (
            <IconButton 
              variant="ghost" 
              size="1" 
              onClick={toggleSidebar}
            >
              <Menu size={18} />
            </IconButton>
          )}
          <Text size="3" weight="medium">{chat.title}</Text>
        </Flex>
      </Flex>
      
      {/* Messages - Scrollable */}
      <Box className="messages-container">
        <ScrollArea 
          style={{ height: '100%' }}
          scrollbars="vertical"
        >
          <Box p="3" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chat.messages.map((msg) => (
              <Flex 
                key={msg.id} 
                justify={msg.isAI ? "start" : "end"}
              >
                <Box
                  style={{ 
                    maxWidth: '85%',
                    backgroundColor: msg.isAI ? 'var(--message-ai-bg)' : 'var(--message-user-bg)',
                    padding: '8px 12px'
                  }}
                >
                  <Flex align="center" gap="2">
                    <Text size="1" weight="medium">
                      {msg.sender}:
                    </Text>
                    <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </Text>
                  </Flex>
                </Box>
              </Flex>
            ))}
            
            {isLoading && (
              <Flex justify="start">
                <Box style={{ 
                  backgroundColor: 'var(--message-ai-bg)',
                  padding: '8px 12px'
                }}>
                  <Flex align="center" gap="2">
                    <Text size="1" weight="medium">
                      AI Assistant:
                    </Text>
                    <Box className="typing-indicator">
                      <Box className="typing-dot" />
                      <Box className="typing-dot" />
                      <Box className="typing-dot" />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            )}
            
            <div ref={messagesEndRef} />
          </Box>
        </ScrollArea>
      </Box>
      
      {/* Message Input - Fixed */}
      <Box 
        style={{ 
          borderTop: '1px solid var(--border-color)',
          flexShrink: 0,
          padding: '16px'
        }}
      >
        <form onSubmit={handleSubmit}>
          <Flex gap="2">
            <Box style={{ flex: 1 }}>
              <TextField.Root 
                size="3" 
                placeholder="Type a message..." 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
              />
            </Box>
            <Button type="submit" size="3" disabled={!message.trim() || isLoading}>
              Send
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
} 