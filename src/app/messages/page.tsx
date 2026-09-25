"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingState } from "@/components/ui/Feedback";
import { BookIcon, CalendarIcon, SendIcon } from "@/components/ui/Icons";
import { api } from "@/lib/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { ChatMessage, ConversationSummary } from "@/types";

function Messages() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [active, setActive] = useState(params.get("c") || "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [context, setContext] = useState<ConversationSummary["context"]>(null);
  const [contact, setContact] = useState<ConversationSummary["contact"] | null>(null);
  const [input, setInput] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => { if (!loading && !user) router.replace("/signin"); }, [loading, user, router]);

  function loadList(selectId?: string) {
    return api<{ conversations: ConversationSummary[] }>("/api/conversations").then((data) => {
      setConversations(data.conversations);
      const next = selectId || active || data.conversations[0]?.id || "";
      setActive(next);
      setReady(true);
    });
  }

  useEffect(() => { if (user) void loadList(params.get("c") || undefined); }, [user]);

  useEffect(() => {
    if (!active || !user) return;
    api<{ messages: ChatMessage[]; conversation: { contact: ConversationSummary["contact"]; context: ConversationSummary["context"] } }>(`/api/conversations/${active}/messages`).then((data) => {
      setMessages(data.messages);
      setContact(data.conversation.contact);
      setContext(data.conversation.context);
    });
  }, [active, user]);

  async function send() {
    if (!input.trim() || !active) return;
    const text = input;
    setInput("");
    const data = await api<{ message: ChatMessage }>(`/api/conversations/${active}/messages`, { method: "POST", body: JSON.stringify({ body: text }) });
    setMessages((current) => [...current, data.message]);
    void loadList(active);
  }

  if (loading || !user || !ready) return <LoadingState />;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-cream">
      <aside className="flex w-full shrink-0 flex-col border-r border-sage bg-white md:w-80">
        <div className="border-b border-sage p-4"><h1 className="font-serif text-xl font-semibold text-forest">Messages</h1></div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && <p className="p-4 text-sm text-muted">No conversations yet. Message a host or seller to start one.</p>}
          {conversations.map((conversation) => (
            <button key={conversation.id} onClick={() => setActive(conversation.id)} className={`flex w-full items-center gap-3 border-b border-sage/50 px-4 py-3.5 text-left ${active === conversation.id ? "bg-mint/40" : "hover:bg-surface"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={conversation.contact.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              <span className="min-w-0 flex-1">
                <span className="flex justify-between text-sm"><span className={conversation.unread ? "font-medium text-forest" : ""}>{conversation.contact.name}</span><span className="text-xs text-muted">{conversation.time}</span></span>
                <span className="block truncate text-xs text-muted">{conversation.lastMessage}</span>
                {conversation.context && <span className="block truncate text-xs text-muted">{conversation.context.type === "book" ? "Book" : "Gathering"} · {conversation.context.title}</span>}
              </span>
              {conversation.unread > 0 && <span className="h-2.5 w-2.5 rounded-full bg-forest" />}
            </button>
          ))}
        </div>
      </aside>
      <section className="hidden min-w-0 flex-1 flex-col md:flex">
        {contact ? (
          <>
            <header className="flex items-center gap-4 border-b border-sage bg-white px-6 py-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={contact.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              <div><p className="text-sm font-medium text-forest">{contact.name}</p>{context && <p className="text-xs text-muted">Re: {context.title}</p>}</div>
            </header>
            {context && (
              <div className="px-6 pt-4">
                <div className="flex max-w-sm items-center gap-3 rounded-xl border border-sage bg-white p-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${context.type === "book" ? "bg-mint" : "bg-yellow"} text-forest`}>{context.type === "book" ? <BookIcon size={16} /> : <CalendarIcon size={16} />}</span>
                  <span><span className="block text-xs capitalize text-muted">{context.type}</span><span className="text-sm font-medium text-forest">{context.title}</span></span>
                </div>
              </div>
            )}
            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-end gap-2 ${message.from === "me" ? "flex-row-reverse" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={message.from === "me" ? user.avatar : contact.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  <div className={`max-w-[60%] rounded-2xl px-4 py-2.5 text-sm ${message.from === "me" ? "rounded-br-sm bg-forest text-white" : "rounded-bl-sm border border-sage bg-white text-body"}`}>
                    <p>{message.text}</p>
                    <p className={`mt-1 text-[11px] ${message.from === "me" ? "text-fresh" : "text-muted"}`}>{message.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 border-t border-sage bg-white px-6 py-4">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" className="flex-1 rounded-xl border border-sage bg-surface px-4 py-2.5 text-sm focus:border-fresh focus:outline-none" />
              <button onClick={send} disabled={!input.trim()} className="rounded-xl bg-forest p-2.5 text-white disabled:opacity-40"><SendIcon /></button>
            </div>
          </>
        ) : <div className="m-auto text-sm text-muted">Select a conversation.</div>}
      </section>
    </div>
  );
}

export default function MessagesPage() {
  return <Suspense><Messages /></Suspense>;
}
