'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { AtmosphericTelemetry, ChatMessage, SupportedLanguage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/translations';
import { parseSseEvent, splitSseEvents } from '@/services/sse-parser';

/**
 * Properties for the StreamingChat component.
 */
export interface StreamingChatProps {
  /** Active multi-pollutant atmospheric telemetry dataset */
  telemetry: AtmosphericTelemetry;
  /** Active internationalization locale */
  language: SupportedLanguage;
}

/**
 * Identifier of the seeded welcome message.
 */
const GREETING_MESSAGE_ID = 'initial';

/**
 * Formats the current wall-clock time as a short HH:MM label.
 *
 * @returns {string} Local time label
 */
function formatTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Builds the localized welcome message.
 *
 * @param language - Active locale
 * @returns {ChatMessage} Seeded assistant greeting
 */
function createGreetingMessage(language: SupportedLanguage): ChatMessage {
  return {
    id: GREETING_MESSAGE_ID,
    role: 'assistant',
    content: TRANSLATIONS[language].chatGreeting ?? '',
    timestamp: formatTimestamp(),
  };
}

/**
 * Grounded Real-Time Atmospheric Chat Assistant component.
 * Streams conversational responses via Server-Sent Events (SSE) grounded in live atmospheric conditions.
 * Buffers partial network chunks so no token is lost, and implements XML boundary fence prompt isolation.
 *
 * @param props - StreamingChatProps configuration
 * @returns {JSX.Element} Rendered streaming conversational interface
 */
export const StreamingChat: React.FC<StreamingChatProps> = ({
  telemetry,
  language,
}): React.JSX.Element => {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createGreetingMessage(language)]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Re-seed the greeting while no conversation has taken place, so it follows the locale.
  useEffect(() => {
    setMessages((previous) =>
      previous.length === 1 && previous[0]?.id === GREETING_MESSAGE_ID
        ? [createGreetingMessage(language)]
        : previous
    );
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateAssistantMessage = (messageId: string, content: string) => {
    setMessages((previous) =>
      previous.map((message) => (message.id === messageId ? { ...message, content } : message))
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming) return;

    setInput('');
    const timestamp = formatTimestamp();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp,
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp,
    };

    setMessages((previous) => [...previous, userMessage, assistantMessage]);
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
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { events, remainder } = splitSseEvents(buffer);
        buffer = remainder;

        for (const event of events) {
          const parsed = parseSseEvent(event);
          if (parsed.done) break;
          if (parsed.text === '') continue;
          accumulated += parsed.text;
          updateAssistantMessage(assistantMessageId, accumulated);
        }
      }
    } catch {
      updateAssistantMessage(
        assistantMessageId,
        `${telemetry.cityName}: AQI ${telemetry.aqiUs}, PM2.5 ${telemetry.pollutants.pm25} µg/m³. ${t.chatOfflineNotice}`
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
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {!isUser && message.content === '' && isStreaming ? (
                  <div className="flex items-center gap-1.5 py-1 text-slate-400">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                    <span>{t.synthesizingResponse}</span>
                  </div>
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {message.timestamp}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="pt-2 pb-2 flex flex-wrap gap-1.5">
        {quickPrompts.map((promptText, index) => (
          <button
            key={index}
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
        onSubmit={(event) => {
          event.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
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
