
import React from 'react';
import { marked } from 'marked';
import { SpecificGuidelineResult } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface SpecificGuidelineCardProps {
  guidelines: SpecificGuidelineResult;
  onDownloadPdf: () => void;
}

const Section: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  const sanitizedHtml = content ? marked(content) : '';
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b-2 border-gray-200 dark:border-gray-700 pb-1">{title}</h3>
      <div 
        className="prose prose-sm sm:prose-base max-w-none text-gray-600 dark:text-gray-300 dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  )
};

const SpecificGuidelineCard: React.FC<SpecificGuidelineCardProps> = ({ guidelines, onDownloadPdf }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Specific Guidelines Report
            </h2>
            <p className="text-md text-gray-500 dark:text-gray-400">
                For Program: <span className="font-semibold">{guidelines.programName}</span>
            </p>
        </div>
        <button
          onClick={onDownloadPdf}
          className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-all duration-300"
        >
          <DownloadIcon className="w-5 h-5" />
          Download as PDF
        </button>
      </div>

      <Section title="Executive Summary" content={guidelines.executiveSummary} />
      <Section title="Identified Strengths" content={guidelines.strengths} />
      <Section title="Areas for Improvement" content={guidelines.areasForImprovement} />
      <Section title="Actionable Recommendations" content={guidelines.recommendations} />

    </div>
  );
};

export default SpecificGuidelineCard;