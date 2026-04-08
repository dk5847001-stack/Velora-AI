import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createChatRequest,
  deleteChatRequest,
  fetchChatByIdRequest,
  fetchChatsRequest,
  sendMessageRequest,
} from "../api/chatApi";
import { getApiErrorMessage } from "../api/apiClient";
import ChatComposer from "../components/ChatComposer";
import ChatHeader from "../components/ChatHeader";
import ChatMessage from "../components/ChatMessage";
import EmptyState from "../components/EmptyState";
import LoadingDots from "../components/LoadingDots";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useAutoScroll } from "../hooks/useAutoScroll";

const DEFAULT_CHAT_TITLE = "New conversation";

const sortChats = (items) =>
  [...items.filter(Boolean)].sort(
    (left, right) =>
      new Date(right.lastMessageAt || right.updatedAt || 0).getTime() -
      new Date(left.lastMessageAt || left.updatedAt || 0).getTime()
  );

const buildSummaryFromChat = (chat) => {
  if (!chat?.id) {
    return null;
  }

  const messages = Array.isArray(chat.messages) ? chat.messages : [];
  const lastMessage = messages[messages.length - 1];

  return {
    id: chat.id,
    title: chat.title || DEFAULT_CHAT_TITLE,
    preview: lastMessage?.content || "",
    lastMessageAt: chat.lastMessageAt || chat.updatedAt || chat.createdAt,
    updatedAt: chat.updatedAt,
    messagesCount: messages.length,
  };
};

const upsertSummary = (items, summary) => {
  if (!summary?.id) {
    return sortChats(items);
  }

  return sortChats([summary, ...items.filter((item) => item.id !== summary.id)]);
};

export default function ChatPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [assistantStatus, setAssistantStatus] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [composerValue, setComposerValue] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageError, setPageError] = useState("");

  const messageViewportRef = useAutoScroll([
    activeChat?.messages?.length,
    activeChatId,
    isResponding,
  ]);

  const applyAssistantStatus = (response) => {
    if (response?.assistant) {
      setAssistantStatus(response.assistant);
    }
  };

  const loadConversation = async (chatId) => {
    if (!chatId) {
      return;
    }

    if (chatId === activeChatId && activeChat) {
      setSidebarOpen(false);
      setPageError("");
      return;
    }

    const previousActiveChatId = activeChatId;
    setActiveChatId(chatId);
    setIsLoadingConversation(true);

    try {
      const response = await fetchChatByIdRequest(chatId);
      const nextChat = response.chat;

      if (!nextChat?.id) {
        throw new Error("The server did not return a valid chat.");
      }

      applyAssistantStatus(response);
      setActiveChat(nextChat);
      setChats((current) => upsertSummary(current, buildSummaryFromChat(nextChat)));
      setPageError("");
      setSidebarOpen(false);
    } catch (error) {
      setActiveChatId(previousActiveChatId);
      setPageError(getApiErrorMessage(error, "Unable to open that conversation."));
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const createChatLocally = async () => {
    const response = await createChatRequest();
    const nextChat = response.chat;

    if (!nextChat?.id) {
      throw new Error("The server did not return a valid chat.");
    }

    applyAssistantStatus(response);
    setActiveChat(nextChat);
    setActiveChatId(nextChat.id);
    setChats((current) => upsertSummary(current, buildSummaryFromChat(nextChat)));
    setPageError("");
    setSidebarOpen(false);
    return nextChat;
  };

  useEffect(() => {
    let isCancelled = false;

    const loadChats = async () => {
      setIsLoadingChats(true);

      try {
        const response = await fetchChatsRequest();

        if (isCancelled) {
          return;
        }

        applyAssistantStatus(response);
        const nextChats = Array.isArray(response.chats) ? response.chats : [];
        const sortedChats = sortChats(nextChats);
        setChats(sortedChats);

        if (sortedChats.length > 0) {
          const firstChat = sortedChats[0];
          setActiveChatId(firstChat.id);

          const conversationResponse = await fetchChatByIdRequest(firstChat.id);

          if (isCancelled) {
            return;
          }

          applyAssistantStatus(conversationResponse);
          setActiveChat(conversationResponse.chat || null);
        } else {
          setActiveChat(null);
          setActiveChatId(null);
        }
      } catch (error) {
        if (!isCancelled) {
          setPageError(getApiErrorMessage(error, "Unable to load your chats."));
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingChats(false);
        }
      }
    };

    loadChats();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleNewChat = async () => {
    setIsCreatingChat(true);

    try {
      await createChatLocally();
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to create a new chat."));
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleDeleteChat = async (chatId) => {
    const target = chats.find((chat) => chat.id === chatId);
    const shouldDelete = window.confirm(
      `Delete "${target?.title || "this chat"}"? This cannot be undone.`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteChatRequest(chatId);
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setChats(remainingChats);

      if (activeChatId === chatId) {
        if (remainingChats.length > 0) {
          await loadConversation(remainingChats[0].id);
        } else {
          setActiveChat(null);
          setActiveChatId(null);
        }
      }
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to delete that chat."));
    }
  };

  const handleSendMessage = async (rawMessage) => {
    const content = rawMessage.trim();

    if (!content || isResponding) {
      return;
    }

    let workingChat = activeChat;

    if (!workingChat) {
      setIsCreatingChat(true);

      try {
        workingChat = await createChatLocally();
      } catch (error) {
        setPageError(getApiErrorMessage(error, "Unable to create a chat for this message."));
        return;
      } finally {
        setIsCreatingChat(false);
      }
    }

    if (!workingChat?.id) {
      setPageError("Unable to find or create a chat for this message.");
      return;
    }

    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    const nowIso = new Date().toISOString();
    const optimisticTitle =
      workingChat.title === DEFAULT_CHAT_TITLE
        ? content.slice(0, 60)
        : workingChat.title || DEFAULT_CHAT_TITLE;

    setComposerValue("");
    setPageError("");
    setIsResponding(true);
    setActiveChat((current) => {
      const nextChat = current || workingChat;
      const currentMessages = Array.isArray(nextChat?.messages) ? nextChat.messages : [];

      return {
        ...nextChat,
        title: optimisticTitle,
        lastMessageAt: nowIso,
        messages: [...currentMessages, optimisticMessage],
      };
    });
    setChats((current) =>
      upsertSummary(current, {
        id: workingChat.id,
        title: optimisticTitle,
        preview: content,
        lastMessageAt: nowIso,
        updatedAt: nowIso,
        messagesCount: (workingChat.messages?.length || 0) + 1,
      })
    );

    try {
      const response = await sendMessageRequest(workingChat.id, content);
      applyAssistantStatus(response);
      setActiveChat(response.chat);
      setChats((current) => upsertSummary(current, buildSummaryFromChat(response.chat)));
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to send your message right now."));

      try {
        const response = await fetchChatByIdRequest(workingChat.id);
        applyAssistantStatus(response);
        setActiveChat(response.chat);
        setChats((current) => upsertSummary(current, buildSummaryFromChat(response.chat)));
      } catch (refreshError) {
        // If refresh fails, the current error banner is enough for the user.
      }
    } finally {
      setIsResponding(false);
    }
  };

  const activeMessages = Array.isArray(activeChat?.messages) ? activeChat.messages : [];
  const conversationTitle = activeChat?.title || DEFAULT_CHAT_TITLE;
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "Y";
  const headerStatus = isLoadingChats || isLoadingConversation
    ? "Loading"
    : isResponding
      ? "Responding"
      : "Synced";
  const handleSuggestion = (suggestion) => {
    setComposerValue(suggestion);
    setPageError("");
  };

  return (
    <div className="app-shell">
      <Sidebar
        user={user}
        chats={chats}
        activeChatId={activeChatId}
        isOpen={sidebarOpen}
        isCreatingChat={isCreatingChat}
        isLoadingConversation={isLoadingConversation}
        onClose={() => setSidebarOpen(false)}
        onDeleteChat={handleDeleteChat}
        onLogout={handleLogout}
        onNewChat={handleNewChat}
        onSelectChat={loadConversation}
      />

      <main className="chat-main">
        <ChatHeader
          assistant={assistantStatus}
          onToggleSidebar={() => setSidebarOpen(true)}
          title={conversationTitle}
          statusText={headerStatus}
          subtitle={
            activeChat
              ? "Your conversation is saved automatically."
              : "Create a chat and start typing."
          }
        />

        {pageError ? <div className="notice notice-error page-notice">{pageError}</div> : null}

        <section ref={messageViewportRef} className="chat-scroll-region">
          {isLoadingChats || isLoadingConversation ? (
            <div className="chat-center-state">
              <LoadingDots label="Loading conversation" />
            </div>
          ) : !activeChat ? (
            <EmptyState
              hasChat={false}
              onNewChat={handleNewChat}
              onSuggestion={handleSuggestion}
            />
          ) : activeMessages.length === 0 ? (
            <EmptyState hasChat onNewChat={handleNewChat} onSuggestion={handleSuggestion} />
          ) : (
            <div className="message-list">
              {activeMessages.map((message, index) => (
                <ChatMessage
                  key={message.id || `${message.createdAt || "message"}-${index}`}
                  message={message}
                  userInitial={userInitial}
                />
              ))}

              {isResponding ? (
                <article className="message-row is-assistant">
                  <div className="message-avatar is-assistant">
                    <span className="message-avatar-brand">V</span>
                  </div>
                  <div className="message-bubble is-assistant message-bubble-loading">
                    <div className="message-meta">
                      <strong>Velora</strong>
                      <span>Thinking</span>
                    </div>
                    <LoadingDots label="Assistant is responding" />
                  </div>
                </article>
              ) : null}
            </div>
          )}
        </section>

        <ChatComposer
          value={composerValue}
          onChange={setComposerValue}
          onSubmit={handleSendMessage}
          isSending={isResponding}
          disabled={isResponding || isLoadingChats || isLoadingConversation}
        />
      </main>
    </div>
  );
}
