import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ChatInput from "../components/ChatInput";
import ChatWindow from "../components/Chatwindow";
import Sidebar from "../components/Sidebar";
import { askQuestion, uploadDocument, uploadImage, getMessages, createChatSession, getChatSessions, deleteChatSession, resetToDefaultGlobalContext, getCurrentUser } from "../services/api";

const Home = () => {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(() => localStorage.getItem("username") || "");
  const [globalContextFileName, setGlobalContextFileName] = useState("");
  const [sessionUploadedFileName, setSessionUploadedFileName] = useState("");

  const navigate = useNavigate();
  const hasActiveChatMessages = messages.some((message) => typeof message.content === "string" && message.content.trim().length > 0);
  const getStoredUserId = () => localStorage.getItem("user_id") || localStorage.getItem("session_id") || "";
  const getChatsCacheKey = () => `chat_sessions_cache_${getStoredUserId()}`;

  const persistChats = (nextChats) => {
    try {
      const key = getChatsCacheKey();
      localStorage.setItem(key, JSON.stringify(nextChats));
    } catch (err) {
      console.warn("Failed to persist chat sessions cache:", err);
    }
  };

  // 1. SECURE ROUTE GUARD
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");

      // If no token exists, immediately bounce them back to the login screen
      if (!token) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const hydrateUsername = async () => {
      const cachedUsername = localStorage.getItem("username");
      if (cachedUsername) {
        setCurrentUsername(cachedUsername);
        return;
      }

      try {
        const user = await getCurrentUser();
        if (user?.username) {
          localStorage.setItem("username", user.username);
          setCurrentUsername(user.username);
        }
      } catch (err) {
        console.warn("Failed to load signed-in username:", err);
      }
    };

    hydrateUsername();
  }, []);

  // Load persisted chat sessions for this user and seed the sidebar with one entry per session.
  useEffect(() => {
    const loadSessions = async () => {
      const userId = getStoredUserId();
      if (!userId) return;

      const cacheKey = getChatsCacheKey();
      const cached = localStorage.getItem(cacheKey);
      let cachedChats = [];

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length) {
            cachedChats = parsed;
            setChats(parsed);
            setCurrentChatId(parsed[0]?.id || null);
            localStorage.setItem("current_chat_session_id", parsed[0]?.id || "");
          }
        } catch (err) {
          console.warn("Failed to parse cached chat sessions:", err);
        }
      }

      try {
        const sessions = await getChatSessions(userId);
        const mapped = sessions.map((session) => {
          const storedTitle = session.title?.trim();
          const firstMessage = session.messages?.find((m) => m?.content?.trim())?.content?.trim();
          const fallbackTitle = storedTitle || firstMessage || "New Chat";
          const title = fallbackTitle.length > 25 ? fallbackTitle.substring(0, 25) + "..." : fallbackTitle;
          const date = session.updated_at
            ? new Date(session.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
            : new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" });

          return {
            id: session.session_id || session._id,
            title,
            date,
            history: [],
            uploaded_file_name: session.uploaded_file_name || "",
          };
        });

        if (mapped.length) {
          setChats(mapped);
          setCurrentChatId(mapped[0]?.id || null);
          localStorage.setItem("current_chat_session_id", mapped[0]?.id || "");
          persistChats(mapped);
        } else if (cachedChats.length) {
          setChats(cachedChats);
          setCurrentChatId(cachedChats[0]?.id || null);
          localStorage.setItem("current_chat_session_id", cachedChats[0]?.id || "");
        }
      } catch (err) {
        console.warn("Failed to load persisted chat sessions:", err);
        if (cachedChats.length) {
          setChats(cachedChats);
          setCurrentChatId(cachedChats[0]?.id || null);
          localStorage.setItem("current_chat_session_id", cachedChats[0]?.id || "");
        }
      }
    };

    loadSessions();
  }, []);

  useEffect(() => {
    const activeChat = chats.find((chat) => chat.id === currentChatId);
    setSessionUploadedFileName(activeChat?.uploaded_file_name || "");
  }, [chats, currentChatId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("session_id");
    localStorage.removeItem("user_id");
    localStorage.removeItem("current_chat_session_id");
    localStorage.removeItem("username");
    setCurrentUsername("");
    navigate("/");
  };

  const handleNewChat = async () => {
    if (currentChatId && !hasActiveChatMessages) {
      return;
    }

    const userId = getStoredUserId();
    if (!userId) {
      console.error("New chat failed: no user id found.");
      return;
    }

    try {
      const session = await createChatSession(userId, "New Chat");
      const nextChatId = session.session_id;
      setCurrentChatId(nextChatId);
      localStorage.setItem("current_chat_session_id", nextChatId);
      setMessages([]);
      setSessionUploadedFileName("");
      setChats((prev) => {
        const next = [
          {
            id: nextChatId,
            title: "New Chat",
            date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            history: [],
          },
          ...prev.filter((c) => c.id !== nextChatId),
        ];
        persistChats(next);
        return next;
      });
    } catch (err) {
      console.warn("Failed to create new chat session:", err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    const userId = getStoredUserId();
    const targetChatId = chatId || localStorage.getItem("current_chat_session_id");
    if (!userId || !targetChatId) return;

    try {
      const result = await deleteChatSession(userId, targetChatId);
      const deleted = result?.deleted ?? true;

      setChats((prev) => {
        const next = prev.filter((c) => c.id !== targetChatId);
        persistChats(next);
        return next;
      });

      if (currentChatId === targetChatId || localStorage.getItem("current_chat_session_id") === targetChatId) {
        setCurrentChatId(null);
        setMessages([]);
        localStorage.setItem("current_chat_session_id", "");
      }

      if (!deleted) {
        console.warn("Delete request returned false, but the local sidebar entry was still removed.");
      }
    } catch (err) {
      console.warn("Failed to delete chat session:", err);
      setChats((prev) => {
        const next = prev.filter((c) => c.id !== targetChatId);
        persistChats(next);
        return next;
      });
      if (currentChatId === targetChatId) {
        setCurrentChatId(null);
        setMessages([]);
        localStorage.setItem("current_chat_session_id", "");
      }
    }
  };

  const handleFileUpload = async (file) => {
    const activeSessionId = currentChatId || localStorage.getItem("current_chat_session_id");
    if (!activeSessionId) {
      console.error("Upload failed: no active chat session found.");
      return;
    }

    try {
      setLoading(true);
      const result = await uploadDocument(file, activeSessionId);
      console.log("Upload result:", result);
      setSessionUploadedFileName(file.name);
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalContextUpload = async (file) => {
    try {
      setLoading(true);
      const result = await uploadDocument(file, null);
      console.log("Global context upload result:", result);
      setGlobalContextFileName(file.name);
    } catch (error) {
      console.error("Global context upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDropGlobalContext = async () => {
    try {
      setLoading(true);
      const result = await resetToDefaultGlobalContext();
      console.log("Drop global context result:", result);
      setGlobalContextFileName("");
    } catch (error) {
      console.error("Drop global context failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareChat = () => {
    if (!messages.length) {
      return;
    }

    const lines = [
      "Laptop RAG Chat Export",
      `User: ${currentUsername || "Unknown User"}`,
      `Chat ID: ${currentChatId || "current"}`,
      "",
    ];

    messages.forEach((msg, index) => {
      const speaker = msg.role === "user" ? "You" : "Assistant";
      const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content, null, 2);
      lines.push(`${speaker} ${index + 1}:`);
      lines.push(content);
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `chat-export-${currentChatId || "current"}.txt`;

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImageUpload = async (file) => {
    const activeSessionId = currentChatId || localStorage.getItem("current_chat_session_id");
    if (!activeSessionId) {
      console.error("Image upload failed: no active chat session found.");
      return;
    }

    try {
      setLoading(true);
      const result = await uploadImage(file, activeSessionId);
      console.log("Image upload result:", result);
      setSessionUploadedFileName(file.name);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.message },
        { role: "assistant", content: result.answer },
      ]);
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chatId) => {
    const selected = chats.find((c) => c.id === chatId);
    if (!selected) return;

    setCurrentChatId(chatId);
    setSessionUploadedFileName(selected.uploaded_file_name || "");

    if (selected.history && selected.history.length > 0) {
      setMessages(selected.history);
      return;
    }

    try {
      const docs = await getMessages(chatId);
      if (docs && docs.length) {
        const loaded = [];
        docs.forEach((d) => {
          if (d.message) loaded.push({ role: "user", content: d.message });
          if (d.answer) loaded.push({ role: "assistant", content: d.answer });
        });

        setMessages(loaded);
        setChats((prev) => {
          const next = prev.map((c) => (c.id === chatId ? { ...c, history: loaded } : c));
          persistChats(next);
          return next;
        });
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn("Failed to load selected chat history:", err);
      setMessages([]);
    }
  };

  const handleSend = async (question) => {
    let activeId = currentChatId || localStorage.getItem("current_chat_session_id");
    const userId = getStoredUserId();

    if (!activeId) {
      if (!userId) {
        throw new Error("No active user id available. Please log in again.");
      }
      const created = await createChatSession(userId, question.length > 25 ? question.substring(0, 25) + "..." : question);
      activeId = created.session_id;
      setCurrentChatId(activeId);
      localStorage.setItem("current_chat_session_id", activeId);
      setChats((prev) => {
        const next = [
          {
            id: activeId,
            title: question.length > 25 ? question.substring(0, 25) + "..." : question,
            date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            history: [],
          },
          ...prev,
        ];
        persistChats(next);
        return next;
      });
    }

    const userMessage = { role: "user", content: question };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setChats((prev) => {
      const next = prev.map((c) => (c.id === activeId ? { ...c, history: updatedMessages } : c));
      persistChats(next);
      return next;
    });

    try {
      setLoading(true);
      const answer = await askQuestion(question, activeId, userId);
      const aiMessage = { role: "assistant", content: answer };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      setChats((prev) => {
        const next = prev.map((c) => (c.id === activeId ? { ...c, history: finalMessages, title: question.length > 25 ? question.substring(0, 25) + "..." : question } : c));
        persistChats(next);
        return next;
      });
    } catch (error) {
      console.error("Chat send failed:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: '100dvh',
      backgroundColor: '#131314', 
      color: '#e3e3e3',
      fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      textAlign: 'left'
    }}>
      
      <Sidebar 
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        handleLogout={handleLogout}
        onGlobalContextUpload={handleGlobalContextUpload}
        activeGlobalContextFileName={globalContextFileName}
        onDropGlobalContext={handleDropGlobalContext}
        username={currentUsername}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative'
      }}>
        
        <header style={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          backgroundColor: '#131314'
        }}>
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <h1 style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              background: 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              margin: 0 
            }}>
              Laptop RAG Assistant
            </h1>

            <button
              type="button"
              onClick={handleShareChat}
              disabled={!messages.length}
              title="Export current chat as text file"
              style={{
                border: '1px solid #282a2c',
                borderRadius: '999px',
                background: '#1e1f20',
                color: '#e3e3e3',
                padding: '8px 12px',
                cursor: messages.length ? 'pointer' : 'not-allowed',
                opacity: messages.length ? 1 : 0.5,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span aria-hidden="true">⤴</span>
              <span>Share</span>
            </button>
          </div>
        </header>

        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            maxWidth: '720px', 
            margin: '0 auto', 
            width: '100%',
            color: '#e3e3e3',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '12px', color: '#9ca3af', fontSize: '13px', display: 'grid', gap: '4px' }}>
              <div>{globalContextFileName ? `Global context: ${globalContextFileName}` : 'Global context: none'}</div>
              <div>{sessionUploadedFileName ? `Session upload: ${sessionUploadedFileName}` : 'Session upload: none'}</div>
            </div>
            <ChatWindow messages={messages} loading={loading} />
          </div>
        </main>

        <footer style={{
          padding: '12px 24px 24px 24px',
          backgroundColor: '#131314'
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
            <div style={{
              backgroundColor: '#1e1f20',
              borderRadius: '32px',
              padding: '8px 16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: '1px solid #282a2c'
            }}>
              <ChatInput
                onSend={handleSend}
                onFileUpload={handleFileUpload}
                onImageUpload={handleImageUpload}
                loading={loading}
              />
            </div>
            <p style={{
              textAlign: 'center',
              fontSize: '11px',
              color: '#80868b',
              marginTop: '12px',
              letterSpacing: '0.3px'
            }}>
              Assistant may display inaccurate info. Verify important responses.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Home;