'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { AtmosphericTelemetry, ChatMessage, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/translations';

interface StreamingChatProps {
  telemetry: AtmosphericTelemetry;
  language: SupportedLanguage;
}

export const StreamingChat: React.FC<StreamingChatProps> = ({ telemetry, language }) => {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      role: 'assistant',
      content:
        language === 'ta'
          ? `வணக்கம்! நான் உங்கள் AerisPulse நேரலை வளிமண்டல சுகாதார உதவியாளர். உங்கள் நகரத்தின் காற்றுத் தரம் குறித்து என்னிடம் கேளுங்கள்.`
          : language === 'hi'
          ? `नमस्ते! मैं आपका AerisPulse वास्तविक समय वायुमंडलीय स्वास्थ्य सहायक हूँ। अपने शहर के लाइव वायु आंकड़ों के बारे में मुझसे प्रश्न पूछें।`
          : `Hello! I am your AerisPulse real-time atmospheric health assistant. Ask me questions grounded strictly in current telemetry for your city.`,
      timestamp: '12:03 AM',
    },
  ]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming) return;

    setInput('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: now,
    };

    const assistantPlaceholderId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          cityId: telemetry.cityId,
          cityName: telemetry.cityName,
          language,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantPlaceholderId
                      ? { ...msg, content: accumulated }
                      : msg
                  )
                );
              }
            } catch (_err) {
              // Non-JSON chunk, append directly
              accumulated += dataStr;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantPlaceholderId
                    ? { ...msg, content: accumulated }
                    : msg
                )
              );
            }
          }
        }
      }
    } catch (_err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
                ...msg,
                content:
                  language === 'ta'
                    ? `${telemetry.cityName}-ல் தற்போதைய AQI ${telemetry.aqiUs} மற்றும் PM2.5 ${telemetry.pollutants.pm25} µg/m³ ஆகும். வெளிப்புற தீவிர உடற்பயிற்சியைத் தவிர்க்கவும்.`
                    : language === 'hi'
                    ? `${telemetry.cityName} में वर्तमान AQI ${telemetry.aqiUs} है और PM2.5 ${telemetry.pollutants.pm25} µg/m³ है। बाहरी गतिविधियों को सीमित करें।`
                    : `In ${telemetry.cityName}, the composite AQI is currently ${telemetry.aqiUs} with PM2.5 at ${telemetry.pollutants.pm25} µg/m³. Outdoor cardio is strongly discouraged because elevated minute ventilation (>3.0 m³/hr) drives fine particulates deep into alveolar tissue. Shift workouts indoors.`,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const quickPrompts = [t.quickPrompt1, t.quickPrompt2, t.quickPrompt3];

  return (
    <section
      aria-labelledby="chat-heading"
      className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[520px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <div>
            <h2
              id="chat-heading"
              className="font-bold text-sm sm:text-base text-slate-900 dark:text-white"
            >
              {t.chatTitle}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.chatSubtitle}
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          AQI {telemetry.aqiUs} • PM2.5: {telemetry.pollutants.pm25} µg
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {!isUser && msg.content === '' && isStreaming ? (
                  <div className="flex items-center gap-1.5 py-1 text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                    <span>Synthesizing response...</span>
                  </div>
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="pt-2 pb-2 flex flex-wrap gap-1.5">
        {quickPrompts.map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(promptText)}
            disabled={isStreaming}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition text-left disabled:opacity-50 border border-slate-200 dark:border-slate-700"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          disabled={isStreaming}
          className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
          aria-label="Ask the atmospheric health assistant"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition"
          aria-label={t.sendBtn}
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
};
