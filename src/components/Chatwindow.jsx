import ChatMessage from "./ChatMessage";

export default function ChatWindow({ messages, loading }) {
  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      boxSizing: "border-box"
    }}>
      {messages.map((msg, i) => (
        <ChatMessage key={i} message={msg} />
      ))}

      {loading && (
        <p style={{ 
          color: "#80868b", 
          fontSize: "14px", 
          margin: "8px 0", 
          fontStyle: "italic" 
        }}>
          Loading...
        </p>
      )}
    </div>
  );
}