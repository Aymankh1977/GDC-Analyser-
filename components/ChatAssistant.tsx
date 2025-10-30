
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col max-h-[70vh]">
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <SparklesIcon className="w-6 h-6 text-blue-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">AI Compliance Assistant</h2>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-4">
            {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                )}
                <div className={`px-4 py-2 rounded-lg max-w-lg ${
                    message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                    <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: marked(message.text) }}
                    />
                </div>
                 {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </div>
                )}
                </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        <div className="flex items-center space-x-2">
                           <SpinnerIcon className="w-4 h-4" />
                           <span>Typing...</span>
                        </div>
                    </div>
                </div>
             )}
            <div ref={messagesEndRef} />
            </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask a follow-up question..."
                className="flex-grow w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={1}
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
                Send
            </button>
            </form>
        </div>
    </div>
  );
};

export default ChatAssistant;
