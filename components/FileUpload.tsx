
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
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-300 ${
        isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
      }`}
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
        <UploadIcon className="w-12 h-12 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-300">
          <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Upload GDC inspection reports (.txt, .md, or .pdf files)
        </p>
        {uploadError && (
          <p className="text-xs text-red-600 dark:text-red-400">{uploadError}</p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
