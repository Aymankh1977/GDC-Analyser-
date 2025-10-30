import React from 'react';

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM21 12h.008v.008H21V12zM12 21v-.008-.008.008V21z" />
  </svg>
);

const EnhancedHeader: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl shadow-lg">
              <SparklesIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                GDC Dental Analyser
              </h1>
              <p className="text-sm text-slate-600 font-medium">Powered by DentEdTech AI</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#analysis" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
              Analysis
            </a>
            <a href="#guidelines" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
              Guidelines
            </a>
            <a href="#assistant" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
              AI Assistant
            </a>
          </nav>

          {/* Status */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">AI Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EnhancedHeader;
