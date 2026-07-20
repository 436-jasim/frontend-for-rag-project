import { useState } from "react";
import ChatInput from "./ChatInput.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { askQuestion, resetToDefaultGlobalContext } from "../services/api.js";

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! Upload a file or ask me anything about your documents." }
  ]);
  const [statusText, setStatusText] = useState("");

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Retrieve active session ID (or fall back to stored user ID/default)
    const sessionId = localStorage.getItem("session_id") || "default_session";
    const tempId = Date.now();

    // 1. Instantly append User message & Loading placeholder
    setMessages((prev) => [
      ...prev,
      { sender: "user", text },
      { id: tempId, sender: "bot", text: "Typing..." }
    ]);

    try {
      // 2. Call askQuestion with BOTH the message and session_id
      const answer = await askQuestion(text, sessionId);

      // 3. Update the placeholder message with the LLM response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { id: tempId, sender: "bot", text: answer } : msg
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { id: tempId, sender: "bot", text: "⚠️ Something went wrong. Make sure you are logged in and have uploaded a document." }
            : msg
        )
      );
    }
  };

  const handleDropGlobalContext = async () => {
    try {
      const result = await resetToDefaultGlobalContext();
      setStatusText(result.message || "Global context dropped. The default dataset is now active.");
    } catch (error) {
      console.error("Reset global context error:", error);
      setStatusText("⚠️ Unable to drop the global context right now.");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200">
        <button
          type="button"
          onClick={handleDropGlobalContext}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Drop Global Context
        </button>
        {statusText ? <span className="text-xs text-slate-600">{statusText}</span> : null}
      </div>
      <ChatWindow messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}