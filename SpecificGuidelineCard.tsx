import React from 'react';
import { marked } from 'marked';
import { SpecificGuidelineResult } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface SpecificGuidelineCardProps {
  guidelines: SpecificGuidelineResult;
  onDownloadPdf: () => void;
}

const Section: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  const renderContent = () => {
    if (!content) {
      return <p className="text-slate-500 italic">No content available</p>;
    }

    try {
      const sanitizedHtml = marked(content);
      return (
        <div 
          className="prose prose-sm max-w-none text-slate-700 leading-relaxed
                     prose-headings:text-slate-800 prose-headings:font-semibold
                     prose-p:mb-3 prose-p:leading-6
                     prose-ul:my-3 prose-li:my-1
                     prose-strong:text-slate-800 prose-strong:font-semibold
                     dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      );
    } catch (error) {
      console.error('Markdown rendering error:', error);
      return <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{content}</div>;
    }
  };

  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-lg font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200 flex items-center">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
        {title}
      </h3>
      <div className="pl-4">
        {renderContent()}
      </div>
    </div>
  );
};

const SpecificGuidelineCard: React.FC<SpecificGuidelineCardProps> = ({ guidelines, onDownloadPdf }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              Specific Guidelines Report
            </h2>
            <p className="text-slate-600">
              Program: <span className="font-semibold text-slate-800">{guidelines.programName}</span>
            </p>
          </div>
          <button
            onClick={onDownloadPdf}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <DownloadIcon className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Section title="Executive Summary" content={guidelines.executiveSummary} />
        <Section title="Identified Strengths" content={guidelines.strengths} />
        <Section title="Areas for Improvement" content={guidelines.areasForImprovement} />
        <Section title="Actionable Recommendations" content={guidelines.recommendations} />
      </div>
    </div>
  );
};

export default SpecificGuidelineCard;
