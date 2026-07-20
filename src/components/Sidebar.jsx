import React, { useRef } from "react";
import { User2 } from "@tailgrids/icons";

export default function Sidebar({ 
  chats = [], 
  currentChatId, 
  onSelectChat, 
  onNewChat,
  onDeleteChat,
  handleLogout,
  onGlobalContextUpload,
  activeGlobalContextFileName,
  onDropGlobalContext,
  username = ""
}) {
  const fileInputRef = useRef(null);

  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-[#282a2c] bg-[#1e1f20] p-4 text-[#e3e3e3]">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            <User2 className="size-4" />
          </span>
          <span className="font-semibold">{username || "User"}</span>
        </div>

        {/* NEW CHAT BUTTON */}
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#282a2c] bg-[#131314] px-3 py-2 text-sm font-medium hover:bg-[#282a2c] hover:text-white transition-all"
        >
          <span>+ New Chat</span>
        </button>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#282a2c] bg-[#131314] px-3 py-2 text-sm font-medium hover:bg-[#282a2c] hover:text-white transition-all"
          >
            <span>{activeGlobalContextFileName || "Upload Global Context"}</span>
          </button>

          {activeGlobalContextFileName ? (
            <button
              type="button"
              onClick={onDropGlobalContext}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#444746] bg-transparent px-3 py-2 text-sm font-medium text-[#c2e7ff] hover:bg-[#282a2c] transition-all"
            >
              <span>Drop Global Context</span>
            </button>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.docx,.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.tif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onGlobalContextUpload?.(file);
              event.target.value = "";
            }
          }}
        />

        {/* RECENT CHATS */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
            Previous Chats
          </p>
          <div className="space-y-1">
            {chats.length === 0 ? (
              <p className="rounded-md px-3 py-2 text-sm text-[#9ca3af]">
                Recent chats appear here
              </p>
            ) : (
              chats.map((chat) => {
                const isActive = currentChatId === chat.id;
                return (
                  <div key={chat.id} className="relative flex items-center">
                    <button
                      onClick={() => onSelectChat?.(chat.id)}
                      className={`w-full rounded-md px-3 py-2 pr-10 text-left text-sm transition-colors ${
                        isActive ? "bg-[#004a77] text-[#c2e7ff]" : "text-[#e3e3e3] hover:bg-[#282a2c]"
                      }`}
                    >
                      <div className="truncate font-medium">{chat.title}</div>
                      {chat.date && <div className="mt-1 text-[11px] opacity-70">{chat.date}</div>}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteChat?.(chat.id);
                      }}
                      title="Delete chat"
                      className="absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-lg leading-none text-[#80868b] hover:bg-[#34373a] hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#9ca3af] hover:bg-[#282a2c] hover:text-white transition-colors"
        >
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}