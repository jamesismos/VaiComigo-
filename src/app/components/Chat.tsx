import { useState } from "react";
import { MessageCircle, Send, Image as ImageIcon } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "driver";
  timestamp: Date;
  image?: string;
}

interface ChatProps {
  driverName?: string;
  driverPhoto?: string;
}

export function Chat({ driverName = "Motorista", driverPhoto }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Olá! Estou a caminho do seu endereço.",
      sender: "driver",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");

    // Simular resposta do motorista
    setTimeout(() => {
      const driverResponse: Message = {
        id: messages.length + 2,
        text: "Entendido! Chegarei em breve.",
        sender: "driver",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, driverResponse]);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header do Chat */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        {driverPhoto ? (
          <img
            src={driverPhoto}
            alt={driverName}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            {driverName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="font-bold">{driverName}</h3>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma mensagem ainda. Inicie uma conversa!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "driver" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm flex-shrink-0">
                  {driverName.charAt(0).toUpperCase()}
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm flex-shrink-0">
                  Você
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input de Mensagem */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ImageIcon size={20} className="text-muted-foreground" />
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
