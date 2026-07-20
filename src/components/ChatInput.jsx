import { useState, useRef } from "react";

export default function ChatInput({ onSend, onFileUpload, onImageUpload, loading }) {
  const [text, setText] = useState("");
  const [pendingUpload, setPendingUpload] = useState(null); // { file, type: 'doc'|'image' }
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const send = () => {
    if (!text.trim() || loading) return;
    onSend(text);
    setText("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || loading) return;
    // Hold selection in local state and let user confirm or remove before uploading
    setPendingUpload({ file, type: "doc" });
    // Do not clear input here so user can re-open selection if desired; we'll clear on cancel/upload
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || loading) return;

    // Hold selection in local state and let user confirm or remove before uploading
    setPendingUpload({ file, type: "image" });
  };

  const triggerFileSelect = () => {
    if (loading) return;
    fileInputRef.current.click();
  };

  const triggerImageSelect = () => {
    if (loading) return;
    imageInputRef.current.click();
  };

  const cancelPending = () => {
    setPendingUpload(null);
    // Reset the underlying inputs so the same file can be re-selected later
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const confirmPending = async () => {
    if (!pendingUpload) return;
    try {
      if (pendingUpload.type === "doc") {
        if (onFileUpload) await onFileUpload(pendingUpload.file);
      } else {
        if (onImageUpload) await onImageUpload(pendingUpload.file);
      }
    } catch (err) {
      // parent handles errors; no-op here
    } finally {
      // clear pending and reset inputs
      cancelPending();
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      minWidth: 0,
      gap: "6px",
      backgroundColor: "transparent",
      boxSizing: "border-box"
    }}>
      {/* HIDDEN FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv, .txt, .docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain"
        disabled={loading}
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageChange}
        accept="image/*"
        disabled={loading}
        style={{ display: "none" }}
      />

      {/* CIRCULAR GEMINI-STYLE ATTACHMENT BUTTON */}
      <button
        onClick={triggerFileSelect}
        disabled={loading}
        title="Upload file"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "transparent",
          border: "none",
          cursor: loading ? "default" : "pointer",
          transition: "background-color 0.2s, transform 0.1s",
          padding: 0,
          marginRight: "4px"
        }}
        onMouseOver={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = "#2f3032";
        }}
        onMouseOut={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = "transparent";
        }}
        onMouseDown={(e) => {
          if (!loading) e.currentTarget.style.transform = "scale(0.95)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {/* Paperclip Attachment Icon */}
        <svg
          style={{
            width: "20px",
            height: "20px",
            color: loading ? "#444746" : "#e3e3e3",
            transition: "color 0.2s"
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      </button>
      <button
        onClick={triggerImageSelect}
        disabled={loading}
        title="Upload image"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "transparent",
          border: "none",
          cursor: loading ? "default" : "pointer",
          transition: "background-color 0.2s, transform 0.1s",
          padding: 0,
          marginRight: "4px"
        }}
        onMouseOver={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = "#2f3032";
        }}
        onMouseOut={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = "transparent";
        }}
        onMouseDown={(e) => {
          if (!loading) e.currentTarget.style.transform = "scale(0.95)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <svg
          style={{
            width: "20px",
            height: "20px",
            color: loading ? "#444746" : "#e3e3e3",
            transition: "color 0.2s"
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7h18M3 12h18M3 17h18"
          />
        </svg>
      </button>

      {/* TEXT INPUT FIELD */}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Ask something..."
        disabled={loading}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#e3e3e3",
          fontSize: "15px",
          padding: "8px 12px",
          fontFamily: "inherit"
        }}
      />

      {/* Pending upload preview + actions */}
      {pendingUpload && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px", flexWrap: "wrap" }}>
          <div style={{ color: "#cfd8dc", fontSize: "13px" }}>{pendingUpload.file.name}</div>
          <button
            onClick={confirmPending}
            disabled={loading}
            style={{ padding: "6px 8px", borderRadius: "8px", background: "#0ea5b7", color: "white", border: "none" }}
          >
            Upload
          </button>
          <button
            onClick={cancelPending}
            disabled={loading}
            style={{ padding: "6px 8px", borderRadius: "8px", background: "transparent", color: "#cfd8dc", border: "1px solid #374151" }}
          >
            Remove
          </button>
        </div>
      )}

      {/* CIRCULAR GEMINI-STYLE SEND BUTTON */}
      <button
        onClick={send}
        disabled={loading || !text.trim()}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: text.trim() && !loading ? "#c2e7ff" : "transparent",
          border: "none",
          cursor: text.trim() && !loading ? "pointer" : "default",
          transition: "background-color 0.2s, transform 0.1s",
          padding: 0,
          marginLeft: "8px"
        }}
        onMouseOver={(e) => {
          if (text.trim() && !loading) e.currentTarget.style.backgroundColor = "#b3dbf7";
        }}
        onMouseOut={(e) => {
          if (text.trim() && !loading) e.currentTarget.style.backgroundColor = "#c2e7ff";
        }}
        onMouseDown={(e) => {
          if (text.trim() && !loading) e.currentTarget.style.transform = "scale(0.95)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <svg 
          style={{ 
            width: "18px", 
            height: "18px", 
            transform: "rotate(90deg)",
            color: text.trim() && !loading ? "#001d35" : "#444746",
            transition: "color 0.2s"
          }} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
        </svg>
      </button>
    </div>
  );
}