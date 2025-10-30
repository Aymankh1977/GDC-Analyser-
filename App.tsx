import React from 'react';
import FileUpload from './components/FileUpload';
import AnalysisResultCard from './components/AnalysisResultCard';
import SpecificGuidelineCard from './components/SpecificGuidelineCard';
import ChatAssistant from './components/ChatAssistant';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Prefer local worker copied to /public/pdf.worker.min.js (safer for builds).
// If not found, fall back to a CDN copy (unpkg/jsdelivr). Adjust version if needed.
GlobalWorkerOptions.workerSrc = ((): string => {
  // Primary: public copy (Netlify will serve /pdf.worker.min.js)
  try {
    return '/pdf.worker.min.js';
  } catch {
    // Fallback CDN (unpkg)
    return 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js';
  }
})();

const App: React.FC = () => {
  // Minimal UI shell; keep your existing components intact so features still work.
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="p-6 bg-white shadow">
        <h1 className="text-2xl font-semibold">GDC Dental Analyser</h1>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Upload</h2>
          <FileUpload />
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Analysis result (demo)</h2>
          <AnalysisResultCard />
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Specific Guidelines</h2>
          <SpecificGuidelineCard />
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Chat assistant</h2>
          <ChatAssistant />
        </section>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} DentEdTeck
      </footer>
    </div>
  );
};

export default App;
