
import React, { useState, useRef, useCallback } from 'react';
import { IconUpload, IconFileCheck, IconXCircle } from './IconComponents';

interface FileUploaderProps {
  id: string;
  label: string;
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string; // e.g., "image/*,application/pdf"
  required?: boolean;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  id,
  label,
  onFileSelect,
  acceptedFileTypes = "*/*",
  required = false,
  className = "",
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation for example (can be expanded)
      if (!acceptedFileTypes.split(',').some(type => file.type.match(type.replace('*', '.*')))) {
         setError(`Invalid file type. Please upload ${acceptedFileTypes}.`);
         setSelectedFile(null);
         onFileSelect(null);
         if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input
         return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setSelectedFile(null);
      onFileSelect(null);
    }
  }, [acceptedFileTypes, onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setError(null);
    const file = event.dataTransfer.files?.[0];
    if (file) {
       if (!acceptedFileTypes.split(',').some(type => file.type.match(type.replace('*', '.*')))) {
         setError(`Invalid file type via drop. Please use ${acceptedFileTypes}.`);
         setSelectedFile(null);
         onFileSelect(null);
         if (fileInputRef.current) fileInputRef.current.value = "";
         return;
      }
      setSelectedFile(file);
      onFileSelect(file);
      if (fileInputRef.current) {
        // To make the input reflect the dropped file (though it's not strictly necessary for functionality if state is managed)
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  }, [acceptedFileTypes, onFileSelect]);

  const removeFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    setError(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={`${id}-input`} className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <label
        htmlFor={`${id}-input`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 ${error ? 'border-red-400' : 'border-slate-300'} border-dashed rounded-md cursor-pointer hover:border-sky-400 transition-colors duration-150 ease-in-out h-32`}
      >
        <div className="space-y-1 text-center">
          {selectedFile ? (
            <div className="flex flex-col items-center text-green-600">
              <IconFileCheck className="w-10 h-10 mb-1" />
              <span className="font-medium">{selectedFile.name}</span>
              <span className="text-xs text-slate-500">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
               <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); removeFile(); }}
                className="mt-2 text-xs text-red-500 hover:text-red-700 font-semibold flex items-center"
              >
                <IconXCircle className="w-3 h-3 mr-1"/> Remove
              </button>
            </div>
          ) : (
            <>
              <IconUpload className="mx-auto h-10 w-10 text-slate-400" />
              <div className="flex text-sm text-slate-600">
                <span className="font-medium text-sky-600 hover:text-sky-500">
                  Upload a file
                </span>
                <input id={`${id}-input`} name={`${id}-input`} type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept={acceptedFileTypes} />
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500">{acceptedFileTypes.replace(/,(\S)/g, ', $1')}</p>
            </>
          )}
        </div>
      </label>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

