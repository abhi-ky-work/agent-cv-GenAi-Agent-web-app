"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Send, User, Loader2, Briefcase, FileText, Info } from "lucide-react";

export default function Home() {
  console.log("Backend Url >>>>>>>>>>>>>", process.env.NEXT_PUBLIC_BACKEND_URL)
  const [messages, setMessages] = useState<{ role: "user" | "agent"; text: string }[]>([
    { role: "agent", text: "Hi! I am Abhishek's AI proxy. I'm equipped with his CV, project history, and career objectives. Ask me anything!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${backendUrl}/agent/invoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            query: userMessage,
            context: "",
            response: ""
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      // Langserve returns the final state in data.output for StateGraphs.
      const agentResponse = data.output?.response || "I'm sorry, I couldn't process that request.";

      setMessages((prev) => [...prev, { role: "agent", text: agentResponse }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "agent", text: "Error communicating with the backend. Please ensure the FastAPI server is running on port 8000." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#0b0c10] text-gray-200 font-sans selection:bg-cyan-500/30">

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl max-w-md w-full shadow-2xl shadow-cyan-900/20 animate-in fade-in zoom-in duration-300">
            <h2 className="text-lg font-bold text-gray-100 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              Welcome to AgentCV
            </h2>
            <div className="text-sm text-gray-300 space-y-3 mb-6 leading-relaxed">
              <p>
                <strong>Heads up:</strong> The first response may take a moment due to server cold starts on my free hosting tier. Subsequent replies will be much faster.
              </p>
              <p>
                <strong>Disclaimer:</strong> This is a Generative AI demonstrator trained on my work experience. The AI can occasionally make mistakes, so please don't rely solely on this information.
              </p>
            </div>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors"
            >
              I understand
            </button>
          </div>
        </div>
      )}
      {/* Premium Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-800 bg-[#0b0c10]/80 backdrop-blur-md sticky top-0 z-10 shadow-sm shadow-cyan-900/10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full shadow-lg shadow-cyan-500/20 overflow-hidden border border-gray-700">
            <Image
              src="/abhishek-photo.jpg"
              alt="Abhishek Yadav"
              width={44}
              height={44}
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              AgentCV
            </h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide">ABHISHEK YADAV</p>
          </div>
        </div>
        <div className="flex gap-4">
          {/* Projects Button Hidden as requested 
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-full border border-gray-700 transition-all">
            <Briefcase className="w-4 h-4" />
            <span>Projects</span>
          </button>
          */}
          <a
            href="/abhishek-cv.pdf"
            download="Abhishek_Yadav_CV.pdf"
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white hover:text-white bg-cyan-600/80 hover:bg-cyan-500 rounded-full border border-cyan-500/50 shadow-md shadow-cyan-900/30 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Download CV</span>
          </a>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-4xl w-full mx-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full shadow-md overflow-hidden ${message.role === "user"
                ? "bg-gray-800 border border-gray-700"
                : "border border-gray-700 shadow-cyan-500/20"
                }`}
            >
              {message.role === "user" ? (
                <User className="w-5 h-5 text-gray-300" />
              ) : (
                <Image
                  src="/abhishek-photo.jpg"
                  alt="Abhishek Avatar"
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`relative max-w-[80%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${message.role === "user"
                ? "bg-gray-800 text-gray-100 rounded-tr-sm border border-gray-700"
                : "bg-gray-900 text-gray-300 rounded-tl-sm border border-gray-800 shadow-inner whitespace-pre-wrap"
                }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-4 animate-in fade-in duration-300">
            <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border border-gray-700 shadow-md shadow-cyan-500/20">
              <Image
                src="/abhishek-photo.jpg"
                alt="Abhishek Avatar"
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-gray-900 rounded-tl-sm border border-gray-800 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-sm text-gray-400">Agent is thinking...</span>
            </div>
          </div>
        )}

        {/* Spacer to push content above fixed input area when scrolled to bottom */}
        <div className="h-32 sm:h-30 flex-shrink-0 w-full" ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/95 to-transparent pt-10 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-center bg-gray-900 border border-gray-700 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 rounded-2xl shadow-xl overflow-hidden transition-all duration-300"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about my experience..."
              className="flex-1 bg-transparent border-none text-gray-200 placeholder-gray-500 px-6 py-4 focus:outline-none focus:ring-0 text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md shadow-cyan-900/50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-[10px] text-gray-500 tracking-wider">
              POWERED BY LANGGRAPH & CREWAI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
