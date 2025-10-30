
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeDocuments, generateSpeech, generateSpecificGuidelines, createChatSession } from './services/geminiService';
import { Chat } from '@google/genai';
import FileUpload from './components/FileUpload';
import AnalysisResultCard from './components/AnalysisResultCard';
import SpecificGuidelineCard from './components/SpecificGuidelineCard';
import ChatAssistant from './components/ChatAssistant';
import SpinnerIcon from './components/icons/SpinnerIcon';
import TrashIcon from './components/icons/TrashIcon';
import { AnalysisResult, TtsStatus, SpecificGuidelineResult, ChatMessage } from './types';
import { decode, decodeAudioData } from './utils/audioUtils';
import { generatePdf } from './utils/pdfUtils';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Set worker src. This is required for pdf.js to work.
GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.mjs';

// Helper to extract text from a PDF file
const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument(arrayBuffer).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + '\n\n';
    }
    return fullText;
};


const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFileForGuideline, setSelectedFileForGuideline] = useState<File | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [specificGuidelines, setSpecificGuidelines] = useState<SpecificGuidelineResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSpecific, setIsGeneratingSpecific] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

  const [bestPracticesTts, setBestPracticesTts] = useState<TtsStatus>(TtsStatus.IDLE);
  const [improvementTts, setImprovementTts] = useState<TtsStatus>(TtsStatus.IDLE);

  // Chat State
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return () => {
        audioContextRef.current?.close();
    }
  }, []);
  
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
  
  const readFileContent = (file: File): Promise<string> => {
    if (file.type === 'application/pdf') {
      return extractTextFromPdf(file);
    }
    return file.text();
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
      
      // Initialize chat with the new context
      const reportContext = `## Best Practice Recommendations\n${result.bestPractices}\n\n## Common Areas for Improvement\n${result.areasForImprovement}`;
      const session = createChatSession(reportContext);
      setChatSession(session);
      setChatHistory([{ role: 'model', text: 'Hello! I am your AI Compliance Assistant. Feel free to ask me any questions about the report above.' }]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while processing files.');
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

        // Initialize chat with the new context
        const reportContext = `## Program Name\n${result.programName}\n\n## Executive Summary\n${result.executiveSummary}\n\n## Strengths\n${result.strengths}\n\n## Areas for Improvement\n${result.areasForImprovement}\n\n## Recommendations\n${result.recommendations}`;
        const session = createChatSession(reportContext);
        setChatSession(session);
        setChatHistory([{ role: 'model', text: 'Hello! I am your AI Compliance Assistant. Ask me anything about the specific guidelines report above.' }]);

    } catch(err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while generating guidelines.');
    } finally {
        setIsGeneratingSpecific(false);
        setProgressMessage(null);
    }
  }, [files, selectedFileForGuideline]);

  const handleSendMessage = async (message: string) => {
    if (!chatSession) return;
    setIsChatLoading(true);
    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: message }];
    setChatHistory(updatedHistory);

    try {
        const response = await chatSession.sendMessage({ message });
        const modelResponse: ChatMessage = { role: 'model', text: response.text };
        setChatHistory([...updatedHistory, modelResponse]);
    } catch(err) {
        const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
        setChatHistory([...updatedHistory, errorMessage]);
        console.error("Chat error:", err);
    } finally {
        setIsChatLoading(false);
    }
  };

  const playAudio = useCallback(async (text: string, setTtsStatus: React.Dispatch<React.SetStateAction<TtsStatus>>) => {
    if (!audioContextRef.current) return;
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
    }
    setBestPracticesTts(TtsStatus.IDLE);
    setImprovementTts(TtsStatus.IDLE);
    setTtsStatus(TtsStatus.LOADING);

    try {
        const base64Audio = await generateSpeech(text);
        const audioData = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
            setTtsStatus(TtsStatus.IDLE);
            audioSourceRef.current = null;
        };
        source.start();
        audioSourceRef.current = source;
        setTtsStatus(TtsStatus.PLAYING);
    } catch (e) {
        console.error("Failed to play audio", e);
        setTtsStatus(TtsStatus.ERROR);
    }
  }, []);

  const handleDownloadPdf = () => {
    if (specificGuidelines) {
        generatePdf(specificGuidelines);
    }
  }
  
  const isAnyLoading = isLoading || isGeneratingSpecific;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-white">
            GDC Dental Analyser
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload GDC inspection reports to identify best practices and generate program-specific guidelines.
          </p>
        </header>

        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 block">1. Upload Documents</h2>
            <FileUpload onFilesUploaded={handleFilesUploaded} isLoading={isAnyLoading} />
          </div>

            {files.length > 0 && (
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Uploaded Documents ({files.length})</h2>
                            <button
                                onClick={handleClearAll}
                                disabled={isAnyLoading}
                                className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Clear All
                            </button>
                        </div>
                        <ul className="space-y-2 rounded-md bg-gray-50 dark:bg-gray-700/50 p-3 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700">
                            {files.map(file => (
                                <li key={file.name} className="flex justify-between items-center text-sm p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600/50">
                                    <span className="text-gray-800 dark:text-gray-200 truncate pr-2">{file.name}</span>
                                    <button 
                                        onClick={() => handleRemoveFile(file)} 
                                        disabled={isAnyLoading} 
                                        className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                                        aria-label={`Remove ${file.name}`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 block">2. Select Target Program for Specific Guidelines</h2>
                        <div className="space-y-2 rounded-md bg-gray-50 dark:bg-gray-700/50 p-4">
                            {files.map(file => (
                                <label key={file.name} className="flex items-center space-x-3 cursor-pointer">
                                    <input 
                                        type="radio"
                                        name="specific-program"
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        checked={selectedFileForGuideline?.name === file.name}
                                        onChange={() => setSelectedFileForGuideline(file)}
                                        disabled={isAnyLoading}
                                    />
                                    <span className="text-gray-800 dark:text-gray-200">{file.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnyLoading}
                            className="w-full flex items-center justify-center bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-800 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                            {isLoading ? <><SpinnerIcon className="w-5 h-5 mr-2" />Analyzing...</> : 'Analyze All (General)'}
                        </button>
                        <button
                            onClick={handleGenerateSpecific}
                            disabled={isAnyLoading || !selectedFileForGuideline}
                            className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
                            >
                            {isGeneratingSpecific ? <><SpinnerIcon className="w-5 h-5 mr-2" />Generating...</> : 'Generate Specific Guidelines'}
                        </button>
                    </div>
                </div>
            )}
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mt-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {isAnyLoading && (
            <div className="text-center mt-8">
                <div className="inline-flex items-center text-gray-600 dark:text-gray-300">
                    <SpinnerIcon className="w-8 h-8 mr-3" />
                    <span className="text-lg">
                        {progressMessage || 'AI is working its magic, this may take a moment...'}
                    </span>
                </div>
            </div>
        )}

        {analysisResult && !isAnyLoading && (
          <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnalysisResultCard 
                title="Best Practice Recommendations"
                content={analysisResult.bestPractices}
                ttsStatus={bestPracticesTts}
                onPlayAudio={() => playAudio(analysisResult.bestPractices, setBestPracticesTts)}
            />
            <AnalysisResultCard 
                title="Common Areas for Improvement" 
                content={analysisResult.areasForImprovement}
                ttsStatus={improvementTts}
                onPlayAudio={() => playAudio(analysisResult.areasForImprovement, setImprovementTts)}
            />
          </div>
        )}

        {specificGuidelines && !isAnyLoading && (
            <div className="max-w-4xl mx-auto mt-12">
                <SpecificGuidelineCard
                    guidelines={specificGuidelines}
                    onDownloadPdf={handleDownloadPdf}
                />
            </div>
        )}

        {chatSession && (
            <div className="max-w-4xl mx-auto mt-8 w-full">
                <ChatAssistant 
                    messages={chatHistory}
                    onSendMessage={handleSendMessage}
                    isLoading={isChatLoading}
                />
            </div>
        )}

      </main>

      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        Copyright © {new Date().getFullYear()} DentEdTeck
      </footer>
    </div>
  );
};

export default App;
