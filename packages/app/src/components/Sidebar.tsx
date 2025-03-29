import { useState, useEffect } from 'react';
import { useNavigate, useMatchRoute } from '@tanstack/react-router';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  ScrollArea,
  Tooltip,
  Separator,
} from '@radix-ui/themes';
import { LogOut, Moon, Sun, MessageSquarePlus, Monitor, Pin } from 'lucide-react';
import { useTheme } from './theme-provider';
import { useChatsShape } from '../shapes';
import { FileList } from './FileList';

// Create a global variable to track sidebar state
let isSidebarOpen = false;
let setSidebarOpen: (value: boolean) => void;

// Export a function to toggle the sidebar that can be used by other components
export function toggleSidebar() {
  if (setSidebarOpen) {
    setSidebarOpen(!isSidebarOpen);
  }
}

export default function Sidebar() {
  const { data: chats } = useChatsShape();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpenState] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const username = localStorage.getItem('username') || 'User';

  // Use TanStack Router to get current chat ID
  const matchRoute = useMatchRoute();
  const chatMatch = matchRoute({ to: '/chat/$chatId' });
  const currentChatId = chatMatch ? chatMatch.chatId : undefined;

  // Set up the global toggle function
  useEffect(() => {
    isSidebarOpen = sidebarOpen;
    setSidebarOpen = setSidebarOpenState;
  }, [sidebarOpen]);

  // Set up window resize handler
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpenState(false);
      }
    };

    handleResize(); // Call immediately
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate({ to: '/' });
  };

  const handleChatClick = (chatId: string) => {
    navigate({ to: `/chat/${chatId}` });
    if (isMobile) {
      setSidebarOpenState(false);
    }
  };

  const handleNewChat = () => {
    navigate({ to: '/' });
    if (isMobile) {
      setSidebarOpenState(false);
    }
  };

  // Sort and separate chats into pinned and unpinned
  const sortedChats = chats.sort((a, b) => {
    // First sort by pinned status
    if (a.pinned !== b.pinned) {
      return b.pinned ? 1 : -1;
    }
    // Then by creation date
    return b.created_at.getTime() - a.created_at.getTime();
  });

  const pinnedChats = sortedChats.filter(chat => chat.pinned);
  const unpinnedChats = sortedChats.filter(chat => !chat.pinned);

  return (
    <>
      {/* Sidebar overlay (mobile only) */}
      {isMobile && (
        <Box
          className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpenState(false)}
        />
      )}

      {/* Sidebar */}
      <Box
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          width: isMobile ? '280px' : '280px',
          height: '100%',
        }}
      >
        {/* Header */}
        <Flex
          p="3"
          align="center"
          justify="between"
          style={{
            height: '56px',
            borderBottom: '1px solid var(--gray-5)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <Text size="3" weight="medium" style={{ paddingLeft: '4px' }}>
            Electric Chat
          </Text>
          {!isMobile && (
            <Tooltip content="New Chat">
              <IconButton variant="ghost" size="2" onClick={handleNewChat}>
                <MessageSquarePlus size={22} />
              </IconButton>
            </Tooltip>
          )}
          {isMobile && (
            <IconButton
              size="1"
              variant="ghost"
              style={{
                position: 'absolute',
                right: '12px',
                opacity: 0.8,
                height: '28px',
                width: '28px',
              }}
              onClick={() => setSidebarOpenState(false)}
            >
              ✕
            </IconButton>
          )}
        </Flex>

        {/* Prominent New Chat button for mobile */}
        {isMobile && (
          <Box p="2">
            <Button
              size="1"
              variant="solid"
              style={{
                width: '100%',
                justifyContent: 'center',
                height: '28px',
              }}
              onClick={handleNewChat}
            >
              <MessageSquarePlus size={14} style={{ marginRight: '8px' }} />
              New Chat
            </Button>
          </Box>
        )}

        {/* Files Section for Active Chat */}
        {currentChatId && <FileList chatId={currentChatId} />}

        {/* Chats */}
        <ScrollArea>
          <div className="sidebar-content">
            <Flex direction="column" gap="1" px="4">
              {/* Pinned Chats Section */}
              {pinnedChats.length > 0 && (
                <>
                  <Box py="2">
                    <Text size="1" color="gray" weight="medium">
                      PINNED CHATS
                    </Text>
                  </Box>
                  {pinnedChats.map(chat => {
                    const isActive = chat.id === currentChatId;
                    return (
                      <Button
                        key={chat.id}
                        variant="ghost"
                        color="gray"
                        size="1"
                        my="1"
                        style={{
                          justifyContent: 'flex-start',
                          height: '22px',
                          backgroundColor: isActive ? 'var(--gray-5)' : undefined,
                          overflow: 'hidden',
                        }}
                        onClick={() => handleChatClick(chat.id)}
                      >
                        <Pin size={12} style={{ marginRight: '8px', opacity: 0.7 }} />
                        <Text
                          size="1"
                          style={{
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {chat.name}
                        </Text>
                      </Button>
                    );
                  })}
                </>
              )}

              {/* Recent Chats Header */}
              <Box py="2">
                <Text size="1" color="gray" weight="medium">
                  RECENT CHATS
                </Text>
              </Box>

              {/* Unpinned Chats */}
              {unpinnedChats.map(chat => {
                const isActive = chat.id === currentChatId;
                return (
                  <Button
                    key={chat.id}
                    variant="ghost"
                    color="gray"
                    size="1"
                    my="1"
                    style={{
                      justifyContent: 'flex-start',
                      height: '22px',
                      backgroundColor: isActive ? 'var(--gray-5)' : undefined,
                      overflow: 'hidden',
                    }}
                    onClick={() => handleChatClick(chat.id)}
                  >
                    <Text
                      size="1"
                      style={{
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {chat.name}
                    </Text>
                  </Button>
                );
              })}
            </Flex>
          </div>
        </ScrollArea>

        {/* Footer */}
        <Box p="2" style={{ marginTop: 'auto' }}>
          <Separator size="4" mb="2" />
          <Flex align="center" justify="between" style={{ padding: '0 8px' }}>
            <Flex align="center" gap="2">
              <Text size="1">{username}</Text>
            </Flex>
            <Flex gap="3">
              <Tooltip
                content={
                  theme === 'dark' ? 'Light mode' : theme === 'light' ? 'System mode' : 'Dark mode'
                }
              >
                <IconButton
                  size="1"
                  variant="ghost"
                  onClick={() => {
                    if (theme === 'dark') setTheme('light');
                    else if (theme === 'light') setTheme('system');
                    else setTheme('dark');
                  }}
                >
                  {theme === 'dark' ? (
                    <Sun size={14} />
                  ) : theme === 'light' ? (
                    <Monitor size={14} />
                  ) : (
                    <Moon size={14} />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip content="Log out">
                <IconButton size="1" variant="ghost" color="red" onClick={handleLogout}>
                  <LogOut size={14} />
                </IconButton>
              </Tooltip>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </>
  );
}
