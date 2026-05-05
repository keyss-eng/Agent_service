import { useState, useRef, useEffect } from "react"
import { API } from "../api/api"
import { useAuth } from "../context/AuthContext"
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  Clock, 
  ShieldCheck,
  Paperclip,
  ChevronRight,
  Trash2 // 👈 New icon added for clear button
} from "lucide-react"

interface Message {
  text: string;
  isUser: boolean;
  time?: string;
  options?: string[];
}

const QUICK_ACTIONS = [
  "Hi",
  "I need an electrician",
  "How do I book a service?",
];

export default function Chat() {
  const { user } = useAuth()
  
  // 👈 1. Initialize state from LocalStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem("bookss_chat_history");
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (e) {
        return [];
      }
    }
    return [];
  })
  
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  // 👈 2. Save messages to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem("bookss_chat_history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages])

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // 👈 3. Function to clear chat history
  const handleClearChat = () => {
    if(window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      localStorage.removeItem("bookss_chat_history");
    }
  }

  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault()
    
    const textToSend = overrideText || input.trim()
    if (!textToSend || isLoading) return

    setInput("")
    setMessages((prev) => [...prev, { text: textToSend, isUser: true, time: getCurrentTime() }])
    setIsLoading(true)

    try {
      const res = await API.post("/chat", {
        sessionId: user ? String(user.id) : "guest_session",
        userName: user ? user.name : "Guest",
        message: textToSend,
      })

      setMessages((prev) => [
        ...prev, 
        { 
          text: res.data.reply, 
          isUser: false, 
          time: getCurrentTime(),
          options: res.data.options 
        }
      ])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [...prev, { 
        text: "Sorry, I am having trouble connecting to the server. Please check your connection.", 
        isUser: false, 
        time: getCurrentTime() 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-slate-50 md:border-x border-slate-200 shadow-sm relative">
      
      {/* 🟢 CHAT HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 border border-sky-200">
              <Bot size={22} />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              BOOKSS AI Assistant
              <ShieldCheck size={14} className="text-sky-500" />
            </h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Clock size={12} /> Usually replies instantly
            </p>
          </div>
        </div>

        {/* 👈 CLEAR CHAT BUTTON */}
        {messages.length > 0 && (
          <button 
            onClick={handleClearChat}
            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 flex items-center gap-2 text-sm font-medium"
            title="Clear Chat History"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* 💬 MESSAGE AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6 animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 shadow-sm">
              <Sparkles size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Hi {user?.name ? user.name.split(' ')[0] : 'there'}! 👋
              </h3>
              <p className="text-slate-500 text-sm">
                I'm your virtual assistant for BOOKSS. I can help you fix issues with AC, Plumbing, or Cleaning.
              </p>
            </div>
            
            <div className="flex flex-col w-full gap-2 mt-4">
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(undefined, action)}
                  className="bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-700 text-sm font-medium py-3 px-4 rounded-xl transition-all text-left flex items-center justify-between group shadow-sm"
                >
                  {action}
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-sky-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Bubbles */}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col gap-2 ${m.isUser ? "items-end" : "items-start"} animate-in slide-in-from-bottom-2 duration-300`}>
            
            <div className={`flex gap-3 ${m.isUser ? "flex-row-reverse" : "flex-row"} max-w-[85%]`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                m.isUser ? "bg-slate-200 text-slate-500" : "bg-sky-500 text-white shadow-sm"
              }`}>
                {m.isUser ? <UserIcon size={16} /> : <Bot size={18} />}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col ${m.isUser ? "items-end" : "items-start"}`}>
                <div 
                  className={`p-3.5 text-sm shadow-sm ${
                    m.isUser 
                      ? "bg-slate-900 text-white rounded-2xl rounded-tr-sm" 
                      : "bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-sm whitespace-pre-wrap leading-relaxed"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium">
                  {m.time || getCurrentTime()}
                </span>
              </div>
            </div>

            {/* 🔘 RENDER INTERACTIVE OPTIONS 🔘 */}
            {!m.isUser && m.options && m.options.length > 0 && i === messages.length - 1 && (
              <div className="flex flex-wrap gap-2 ml-11 mt-1 max-w-[80%]">
                {m.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(undefined, option)}
                    className="bg-white text-sky-600 border border-sky-200 hover:bg-sky-600 hover:text-white text-xs font-semibold py-2 px-4 rounded-full transition-all shadow-sm active:scale-95"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 animate-in fade-in duration-300">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-500 text-white shadow-sm flex items-center justify-center mt-1">
              <Bot size={18} />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 flex items-center gap-1.5 h-[46px]">
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* ⌨️ INPUT AREA */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={(e) => handleSend(e)} className="relative flex items-end gap-2 max-w-3xl mx-auto">
          
          <button type="button" className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors flex-shrink-0">
            <Paperclip size={20} />
          </button>

          <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-200 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 focus-within:bg-white transition-all overflow-hidden flex items-center px-4 py-1.5">
            <input
              className="w-full bg-transparent border-none focus:outline-none text-slate-700 text-sm py-2 placeholder:text-slate-400"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 flex items-center justify-center bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full flex-shrink-0 transition-all shadow-md active:scale-95"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-[10px] text-slate-400 font-medium">
            BOOKSS AI - Built for professional home maintenance.
          </p>
        </div>
      </div>
    </div>
  )
}