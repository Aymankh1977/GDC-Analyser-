
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
  const sanitizedHtml = content ? marked(content) : '';
  const isButtonDisabled = ttsStatus === TtsStatus.LOADING || ttsStatus === TtsStatus.PLAYING;

  const renderTtsButton = () => {
    switch (ttsStatus) {
      case TtsStatus.LOADING:
        return <SpinnerIcon className="w-5 h-5" />;
      case TtsStatus.PLAYING:
        return <SpeakerIcon className="w-5 h-5 text-green-500" />;
      case TtsStatus.ERROR:
        return <SpeakerIcon className="w-5 h-5 text-red-500" isMuted />;
      default:
        return <SpeakerIcon className="w-5 h-5" />;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        {content && (
            <button
                onClick={onPlayAudio}
                disabled={isButtonDisabled}
                className="p-2 rounded-full transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Read ${title} aloud`}
            >
                {renderTtsButton()}
            </button>
        )}
      </div>
      <div 
        className="prose prose-sm sm:prose-base max-w-none text-gray-600 dark:text-gray-300 dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
};

export default AnalysisResultCard;
