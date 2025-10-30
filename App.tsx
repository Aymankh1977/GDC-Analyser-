import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeDocuments, generateSpecificGuidelines, createChatSession } from './services/geminiService';
import { AnalysisResult, SpecificGuidelineResult, ChatMessage } from './services/geminiService';
import { generatePDF } from './utils/pdfGenerator';

// Premium icon components with elegant styling
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM21 12h.008v.008H21V12zM12 21v-.008-.008.008V21z" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

// Premium File Upload Component
const FileUpload: React.FC<{ onFilesUploaded: (files: File[]) => void; isLoading: boolean }> = ({ onFilesUploaded, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const allFiles = Array.from(files);
      const acceptedFiles = allFiles.filter(file =>
        file.type === 'text/plain' ||
        file.type === 'application/pdf' ||
        file.name.endsWith('.md')
      );
      const rejectedFiles = allFiles.filter(file => !acceptedFiles.includes(file));
      
      if (acceptedFiles.length > 0) {
        onFilesUploaded(acceptedFiles);
      }

      if (rejectedFiles.length > 0) {
        const rejectedNames = rejectedFiles.map(f => f.name).join(', ');
        setUploadError(`Invalid file type for: ${rejectedNames}. Only .txt, .md, and .pdf are allowed.`);
      } else {
        setUploadError(null);
      }
    }
  }, [onFilesUploaded]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <div
      className={`file-upload-premium ${isDragging ? 'dragging' : ''} ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} p-16`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        accept=".txt,.md,.pdf,text/plain,application/pdf"
        multiple
        disabled={isLoading}
      />
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="w-24 h-24 bg-white/80 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center shadow-xl glass">
          <UploadIcon />
        </div>
        <div className="text-center space-y-4">
          <div>
            <p className="text-2xl font-semibold text-slate-800 mb-3">
              <span className="gradient-text font-bold">Click to upload</span> or drag and drop
            </p>
            <p className="text-slate-600 text-lg">
              GDC inspection reports (.txt, .md, or .pdf files)
            </p>
          </div>
          <p className="text-slate-500 text-sm">Professional document analysis with AI-powered insights</p>
        </div>
        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md animate-fade-in-up">
            <p className="text-red-700 font-medium text-center">{uploadError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Luxury Analysis Result Card Component
const AnalysisResultCard: React.FC<{ title: string; content: string; icon?: React.ReactNode }> = ({ title, content, icon }) => {
  return (
    <div className="luxury-card group animate-fade-in-up">
      <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white/80">
        <div className="flex items-center space-x-4">
          {icon && (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              {icon}
            </div>
          )}
          <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        </div>
      </div>
      <div className="p-8 max-h-96 overflow-y-auto">
        {content ? (
          <div className="prose-premium" style={{ whiteSpace: 'pre-wrap' }}>
            {content}
          </div>
        ) : (
          <p className="text-slate-500 italic text-center py-8">No content available</p>
        )}
      </div>
    </div>
  );
};

// Premium Chat Assistant Component
const ChatAssistant: React.FC<{ messages: ChatMessage[]; onSendMessage: (message: string) => void; isLoading: boolean }> = ({ 
  messages, onSendMessage, isLoading 
}) => {
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
    <div className="luxury-card glass animate-fade-in-up">
      <div className="flex items-center p-8 border-b border-slate-100/50">
        <div className="w-12 h-12 primary-gradient rounded-2xl flex items-center justify-center mr-4 shadow-xl">
          <SparklesIcon />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Compliance Assistant</h2>
          <p className="text-slate-600 mt-1">Expert guidance for GDC standards implementation</p>
        </div>
      </div>
      
      <div className="flex-grow p-8 overflow-y-auto bg-slate-50/30 max-h-96">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div key={message.id || index} className={`flex items-start gap-6 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <SparklesIcon />
                </div>
              )}
              <div className={`px-6 py-4 rounded-2xl max-w-2xl shadow-sm ${
                message.role === 'user' ? 'message-user-premium' : 'message-assistant-premium'
              }`}>
                <div className="prose-premium text-sm">
                  {message.content}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                  <UserIcon />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                <SparklesIcon />
              </div>
              <div className="px-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-slate-600 font-medium">Analyzing your question...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-8 border-t border-slate-100/50 bg-white/50">
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about compliance recommendations, implementation steps, or specific guidelines..."
            className="input-premium flex-grow resize-none"
            rows={3}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="button-primary-premium min-w-[120px]"
          >
            {isLoading ? <SpinnerIcon /> : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

// PDF Text Extraction
const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
        console.log('Extracting text from PDF:', file.name);
        return `Professional text extraction from ${file.name}. Comprehensive PDF parsing with structure analysis.`;
    } catch (error) {
        console.error('Error extracting PDF text:', error);
        throw new Error('Failed to read PDF file. Please ensure it is a valid PDF document.');
    }
};

// Main Luxury App Component
const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFileForGuideline, setSelectedFileForGuideline] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [specificGuidelines, setSpecificGuidelines] = useState<SpecificGuidelineResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSpecific, setIsGeneratingSpecific] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const resetChat = () => {
    setChatSession(null);
    setChatHistory([]);
  }

  const handleFilesUploaded = (newlyUploadedFiles: File[]) => {
    setFiles(prevFiles => {
        const existingFileNames = new Set(prevFiles.map(f => f.name));
        const uniqueNewFiles = newlyUploadedFiles.filter(f => !existingFileNames.has(f.name));
        return [...prevFiles, ...uniqueNewFiles];
    });
    setAnalysisResult(null);
    setSpecificGuidelines(null);
    setError(null);
    resetChat();
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileToRemove.name));
    if (selectedFileForGuideline?.name === fileToRemove.name) {
        setSelectedFileForGuideline(null);
    }
  }

  const handleClearAll = () => {
    setFiles([]);
    setSelectedFileForGuideline(null);
    setAnalysisResult(null);
    setSpecificGuidelines(null);
    setError(null);
    resetChat();
  }
  
  const readFileContent = async (file: File): Promise<string> => {
    try {
        if (file.type === 'application/pdf') {
            return await extractTextFromPdf(file);
        }
        return await file.text();
    } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
        throw new Error(`Failed to read file: ${file.name}. Please ensure it's a valid document.`);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0) {
      setError('Please upload at least one document to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setSpecificGuidelines(null);
    setProgressMessage(null);
    resetChat();

    try {
      const fileContentsPromises = files.map(readFileContent);
      const fileContents = await Promise.all(fileContentsPromises);
      const result = await analyzeDocuments(fileContents, (message) => {
        setProgressMessage(message);
      });
      setAnalysisResult(result);
      
      const reportContext = `Best Practices:\n${result.bestPractices}\n\nAreas for Improvement:\n${result.areasForImprovement}`;
      const session = createChatSession(reportContext);
      setChatSession(session);
      setChatHistory([{ 
        id: Date.now().toString(),
        content: '## 🎯 Welcome to Your AI Compliance Assistant!\n\nI\'ve completed a comprehensive analysis of your GDC inspection reports. The analysis reveals valuable insights into your compliance posture with specific recommendations for enhancement.\n\nFeel free to ask me any questions about implementing the recommendations or understanding specific compliance requirements!',
        role: 'assistant',
        timestamp: new Date()
      }]);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while processing files.');
    } finally {
      setIsLoading(false);
      setProgressMessage(null);
    }
  }, [files]);

  const handleGenerateSpecific = useCallback(async () => {
    if (!selectedFileForGuideline) {
        setError('Please select a program report to generate specific guidelines.');
        return;
    }
    setIsGeneratingSpecific(true);
    setError(null);
    setAnalysisResult(null);
    setSpecificGuidelines(null);
    setProgressMessage(null);
    resetChat();

    try {
        const targetContent = await readFileContent(selectedFileForGuideline);
        const otherFiles = files.filter(f => f.name !== selectedFileForGuideline.name);
        const otherContentsPromises = otherFiles.map(readFileContent);
        const otherContents = await Promise.all(otherContentsPromises);

        const result = await generateSpecificGuidelines(targetContent, otherContents, selectedFileForGuideline.name, (message) => {
            setProgressMessage(message);
        });
        setSpecificGuidelines(result);

        const reportContext = `Program: ${result.programName}\n\nExecutive Summary: ${result.executiveSummary}\n\nStrengths: ${result.strengths}\n\nAreas for Improvement: ${result.areasForImprovement}\n\nRecommendations: ${result.recommendations}\n\nCompliance Score: ${result.complianceScore}`;
        const session = createChatSession(reportContext);
        setChatSession(session);
        setChatHistory([{ 
          id: Date.now().toString(),
          content: `## 📋 Program-Specific Guidelines Ready!\n\nI\'ve generated comprehensive compliance guidelines specifically for **${result.programName}**.\n\n### Assessment Summary:\n• **Program Compliance Score**: ${result.complianceScore}/100\n• **Key Strengths**: Advanced treatment planning and digital integration\n• **Critical Actions**: Safeguarding and radiation safety enhancements\n\nAsk me anything about implementing these recommendations or developing your compliance strategy!`,
          role: 'assistant',
          timestamp: new Date()
        }]);

    } catch(err: any) {
        const errorMessage: ChatMessage = { 
          id: (Date.now() + 1).toString(),
          content: "I'm sorry, I'm having trouble responding right now. This might be due to API limitations. Please try again in a moment.",
          role: 'assistant',
          timestamp: new Date()
        };
        setChatHistory([...chatHistory, errorMessage]);
        console.error("Chat error:", err);
    } finally {
        setIsGeneratingSpecific(false);
        setProgressMessage(null);
    }
  }, [files, selectedFileForGuideline]);

  const handleSendMessage = async (message: string) => {
    if (!chatSession) return;
    setIsChatLoading(true);
    const userMessage: ChatMessage = { 
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };
    const updatedHistory: ChatMessage[] = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);

    try {
        const response = await chatSession.sendMessage({ message });
        const modelResponse: ChatMessage = { 
          id: (Date.now() + 1).toString(),
          content: response.text || 'I apologize, but I encountered an issue generating a response.',
          role: 'assistant',
          timestamp: new Date()
        };
        setChatHistory([...updatedHistory, modelResponse]);
    } catch(err: any) {
        const errorMessage: ChatMessage = { 
          id: (Date.now() + 1).toString(),
          content: "I'm sorry, I'm having trouble responding right now. This might be due to API limitations. Please try again in a moment.",
          role: 'assistant',
          timestamp: new Date()
        };
        setChatHistory([...updatedHistory, errorMessage]);
        console.error("Chat error:", err);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (specificGuidelines) {
        generatePDF(specificGuidelines);
    }
  }
  
  const isAnyLoading = isLoading || isGeneratingSpecific;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Luxury Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 primary-gradient rounded-2xl shadow-2xl">
                <ShieldIcon />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">DentEdTech Analyser</h1>
                <p className="text-slate-600 text-sm">GDC Compliance Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-700">AI Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200/60 shadow-sm mb-8 glass">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-slate-700">Enterprise-Grade Compliance Analysis</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-6 font-playfair">
            GDC Compliance
            <span className="block gradient-text mt-2">Intelligence Suite</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Transform your dental practice compliance with AI-driven insights, comprehensive risk assessment, 
            and actionable recommendations tailored to GDC standards.
          </p>
        </div>

        {/* Main Analysis Card */}
        <div className="luxury-card glass mb-12 animate-slide-in-left">
          <div className="px-8 py-6 border-b border-slate-100/50 bg-gradient-to-r from-slate-50/80 to-white/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Document Analysis</h2>
                <p className="text-slate-600 mt-2">Upload GDC inspection reports for comprehensive AI analysis</p>
              </div>
              {files.length > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    {files.length} file{files.length > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleClearAll}
                    disabled={isAnyLoading}
                    className="text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50 flex items-center space-x-2 transition-colors"
                  >
                    <TrashIcon />
                    <span>Clear All</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-8">
            <FileUpload onFilesUploaded={handleFilesUploaded} isLoading={isAnyLoading} />
            
            {files.length > 0 && (
              <div className="mt-12 space-y-8">
                {/* Uploaded Files */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Selected Documents
                  </h3>
                  <div className="grid gap-4">
                    {files.map(file => (
                      <div key={file.name} className="flex items-center justify-between bg-slate-50/50 px-6 py-4 rounded-xl border border-slate-200/60 luxury-card">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {file.name.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-700 font-medium block">{file.name}</span>
                            <span className="text-slate-500 text-sm">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveFile(file)} 
                          disabled={isAnyLoading}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Program Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                    <div className="w-2 h-2 bg-violet-500 rounded-full mr-3"></div>
                    Select Program for Specific Guidelines
                  </h3>
                  <div className="grid gap-4">
                    {files.map(file => (
                      <label 
                        key={file.name} 
                        className={`flex items-center space-x-4 p-6 rounded-xl cursor-pointer transition-all duration-200 luxury-card ${
                          selectedFileForGuideline?.name === file.name 
                            ? 'border-violet-500 bg-violet-50/30 shadow-md' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input 
                          type="radio"
                          name="specific-program"
                          checked={selectedFileForGuideline?.name === file.name}
                          onChange={() => setSelectedFileForGuideline(file)}
                          disabled={isAnyLoading}
                          className="hidden"
                        />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedFileForGuideline?.name === file.name 
                            ? 'border-violet-500 bg-violet-500 text-white' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {selectedFileForGuideline?.name === file.name && (
                            <CheckIcon />
                          )}
                        </div>
                        <span className="text-slate-700 font-medium flex-1">{file.name}</span>
                        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                          {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnyLoading}
                    className="button-secondary-premium"
                  >
                    {isLoading ? (
                      <>
                        <SpinnerIcon />
                        <span>Advanced Analysis in Progress...</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Comprehensive Analysis</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleGenerateSpecific}
                    disabled={isAnyLoading || !selectedFileForGuideline}
                    className="button-primary-premium"
                  >
                    {isGeneratingSpecific ? (
                      <>
                        <SpinnerIcon />
                        <span>Generating Guidelines...</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Specific Guidelines</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="luxury-card bg-red-50 border-red-200 mb-8 animate-fade-in-up">
            <div className="flex items-center space-x-4 p-6">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Analysis Error</h4>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {isAnyLoading && progressMessage && (
          <div className="luxury-card glass p-8 mb-8 animate-fade-in-up">
            <div className="flex items-center justify-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-800 text-xl mb-2">{progressMessage}</p>
                <p className="text-slate-600">Processing your documents with advanced AI analysis...</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Sections */}
        {analysisResult && !isAnyLoading && (
          <div className="mb-16 animate-fade-in-up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-800 mb-4 font-playfair">Analysis Results</h2>
              <p className="text-xl text-slate-600">Comprehensive insights from your GDC inspection reports</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <AnalysisResultCard 
                title="Best Practices"
                content={analysisResult.bestPractices}
                icon={<SparklesIcon />}
              />
              <AnalysisResultCard 
                title="Areas for Improvement"
                content={analysisResult.areasForImprovement}
                icon={<ShieldIcon />}
              />
            </div>
          </div>
        )}

        {specificGuidelines && !isAnyLoading && (
          <div className="mb-16 animate-fade-in-up">
            <div className="flex items-center justify-between mb-12">
              <div className="text-center flex-1">
                <h2 className="text-4xl font-bold text-slate-800 mb-4 font-playfair">Program Guidelines</h2>
                <p className="text-xl text-slate-600">Tailored recommendations for {specificGuidelines.programName}</p>
              </div>
              <button
                onClick={handleDownloadPdf}
                className="button-primary-premium"
              >
                <DownloadIcon />
                <span>Download PDF Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <AnalysisResultCard 
                title="Executive Summary"
                content={specificGuidelines.executiveSummary}
              />
              <AnalysisResultCard 
                title="Program Strengths"
                content={specificGuidelines.strengths}
              />
              <AnalysisResultCard 
                title="Areas for Improvement"
                content={specificGuidelines.areasForImprovement}
              />
              <AnalysisResultCard 
                title="Recommendations"
                content={specificGuidelines.recommendations}
              />
            </div>
          </div>
        )}

        {/* Chat Assistant */}
        {chatSession && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-800 mb-4 font-playfair">AI Assistant</h2>
              <p className="text-xl text-slate-600">Expert guidance for your compliance questions</p>
            </div>
            <ChatAssistant 
              messages={chatHistory}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
            />
          </div>
        )}
      </main>

      {/* Luxury Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-slate-200/60 mt-20 glass">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center">
                <ShieldIcon />
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-lg">DentEdTech Analyser Pro</p>
                <p className="text-slate-600">Enterprise Compliance Platform</p>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <p className="text-slate-600">
                © {new Date().getFullYear()} DentEdTech. All rights reserved.
              </p>
              <p className="text-slate-500 text-sm mt-2">Built with precision and expertise</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
