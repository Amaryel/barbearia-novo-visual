import { useRef, useState } from "react";
import "./ChatWidget.css";

const welcome = {
  role: "assistant",
  text: "Olá! Sou o assistente da Novo Visual. Posso tirar dúvidas sobre serviços, horários e agendamentos.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  function toggle() {
    setOpen((value) => !value);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function send(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const updatedMessages = [...messages, { role: "user", text }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.slice(-10).map(({ role, text: content }) => ({ role, content })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível responder agora.");
      setMessages((current) => [...current, { role: "assistant", text: data.reply }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: error.message }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <aside className="chat-widget" aria-label="Assistente virtual">
      {open && (
        <section id="chat-panel" className="chat-widget__panel" aria-live="polite">
          <header className="chat-widget__header">
            <div><strong>Assistente Novo Visual</strong><span>Online para ajudar</span></div>
            <button type="button" onClick={toggle} aria-label="Fechar conversa">×</button>
          </header>
          <div className="chat-widget__messages">
            {messages.map((message, index) => <p className={`chat-widget__message chat-widget__message--${message.role}`} key={`${message.role}-${index}`}>{message.text}</p>)}
            {loading && <p className="chat-widget__typing">Escrevendo…</p>}
          </div>
          <form className="chat-widget__form" onSubmit={send}>
            <label className="visually-hidden" htmlFor="chat-message">Sua mensagem</label>
            <input id="chat-message" ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Como posso ajudar?" maxLength="800" disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()}>Enviar</button>
          </form>
        </section>
      )}
      <button className="chat-widget__launcher" type="button" onClick={toggle} aria-expanded={open} aria-controls="chat-panel">
        <span aria-hidden="true">✦</span>{open ? "Fechar" : "Fale com a gente"}
      </button>
    </aside>
  );
}
