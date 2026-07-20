export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  const renderContent = (content) => {
    if (!content) return null;

    const paragraphs = content.split(/\n{2,}/g);

    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;

      const lines = trimmed.split(/\n+/g);
      const isList = lines.every((line) => /^\s*[-*+]\s+/.test(line));

      if (isList) {
        return (
          <ul key={index} style={{ margin: '8px 0', paddingLeft: '20px' }}>
            {lines.map((line, liIndex) => {
              const item = line.replace(/^\s*[-*+]\s+/, '').trim();
              return (
                <li key={liIndex} style={{ marginBottom: '4px', lineHeight: '1.6' }}>
                  {item}
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p key={index} style={{ margin: '8px 0', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      margin: '12px 0',
      width: '100%',
      minWidth: 0,
      boxSizing: 'border-box'
    }}>
      <div
        style={{
          padding: '14px 18px',
          borderRadius: '20px',
          backgroundColor: isUser ? '#2b3945' : '#111316',
          color: '#e3e3e3',
          maxWidth: '85%',
          fontSize: '15px',
          lineHeight: '1.6',
          wordBreak: 'break-word',
          boxSizing: 'border-box',
          boxShadow: isUser ? '0 2px 8px rgba(0,0,0,0.1)' : '0 0 0 1px rgba(255,255,255,0.04)'
        }}
      >
        {renderContent(message.content)}
      </div>
    </div>
  );
}