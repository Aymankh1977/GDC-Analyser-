import React from 'react';
import { marked } from 'marked';
import { TtsStatus } from '../types';
import SpeakerIcon from './icons/SpeakerIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface AnalysisResultCardProps {
  title: string;
  content: string;
  ttsStatus: TtsStatus;
  onPlayAudio: () => void;
}

const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ title, content, ttsStatus, onPlayAudio }) => {
  // Safe markdown rendering with better styling
  const renderContent = () => {
    if (!content) {
      return <p className="text-slate-500 italic">No content available</p>;
    }

    try {
      const sanitizedHtml = marked(content);
      return (
        <div 
          className="prose prose-sm max-w-none text-slate-700 leading-relaxed
                     prose-headings:text-slate-800 prose-headings:font-semibold prose-headings:mb-3
                     prose-h2:text-lg prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2
                     prose-p:mb-3 prose-p:leading-6
                     prose-ul:my-3 prose-li:my-1
                     prose-strong:text-slate-800 prose-strong:font-semibold
                     prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded
                     dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    } catch (error) {
      console.error('Markdown rendering error:', error);
      return <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{content}</div>;
    }
  };

  const isButtonDisabled = ttsStatus === TtsStatus.LOADING || ttsStatus === TtsStatus.PLAYING;

  const renderTtsButton = () => {
    switch (ttsStatus) {
      case TtsStatus.LOADING:
        return <SpinnerIcon className="w-4 h-4 animate-spin" />;
      case TtsStatus.PLAYING:
        return <SpeakerIcon className="w-4 h-4 text-green-500" />;
      case TtsStatus.ERROR:
        return <SpeakerIcon className="w-4 h-4 text-red-500" isMuted />;
      default:
        return <SpeakerIcon className="w-4 h-4 text-slate-600" />;
    }
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            {title}
          </h2>
          {content && (
            <button
              onClick={onPlayAudio}
              disabled={isButtonDisabled}
              className="p-2 rounded-lg transition-all duration-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Read ${title} aloud`}
            >
              {renderTtsButton()}
            </button>
          )}
        </div>
      </div>
      <div className="p-6 max-h-96 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AnalysisResultCard;
