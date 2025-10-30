import React, { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { ChatMessage } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import UserIcon from './icons/UserIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface ChatAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
  }

  // Safe markdown rendering
  const renderMarkdown = (text: string) => {
    if (!text) return '';
    try {
      return marked(text);
    } catch (error) {
      console.error('Markdown rendering error:', error);
      return text;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col max-h-[70vh]">
        <div className="flex items-center p-6 border-b border-slate-200 dark:border-gray-700">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl flex items-center justify-center mr-3">
                <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">AI Compliance Assistant</h2>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
            <div className="space-y-4">
            {messages.map((message, index) => (
                <div key={message.id || index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                )}
                <div className={`px-4 py-3 rounded-2xl max-w-lg ${
                    message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-200 rounded-bl-none'
                }`}>
                    <div
                        className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                    />
                </div>
                 {message.role === 'user' && (
                    <div className="w-8 h-8 bg-slate-200 dark:bg-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <UserIcon className="w-4 h-4 text-slate-700 dark:text-gray-300" />
                    </div>
                )}
                </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-200 rounded-bl-none">
                        <div className="flex items-center space-x-2">
                           <SpinnerIcon className="w-4 h-4 animate-spin" />
                           <span className="text-slate-600 dark:text-gray-400">Analyzing your question...</span>
                        </div>
                    </div>
                </div>
             )}
            <div ref={messagesEndRef} />
            </div>
        </div>
        <div className="p-6 border-t border-slate-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about compliance recommendations, implementation steps, or specific guidelines..."
                className="flex-grow w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                rows={1}
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-violet-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/25 flex-shrink-0"
            >
                Send
            </button>
            </form>
        </div>
    </div>
  );
};

export default ChatAssistant;
