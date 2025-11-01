import React, { useState, useCallback } from 'react';
import UploadIcon from './icons/UploadIcon';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesUploaded, isLoading }) => {
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
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
        isDragging 
          ? 'border-blue-400 bg-blue-50/50 shadow-inner' 
          : 'border-slate-300 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30'
      } ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        accept=".txt,.md,.pdf,text/plain,application/pdf"
        multiple
        disabled={isLoading}
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
          <UploadIcon className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <p className="text-slate-700 font-medium">
            <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-slate-500 mt-1">
            GDC inspection reports (.txt, .md, or .pdf files)
          </p>
        </div>
        {uploadError && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
