'use client';

import { useState, useCallback, ChangeEvent, DragEvent } from 'react';

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  onClose: () => void;
}

export default function ImageUploader({ onUploadComplete, onClose }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      // Basic client-side validation
      if (!selectedFile.type.startsWith('image/')) {
        setError('Invalid file type. Please select an image.');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File is too large. Maximum size is 5MB.');
        return;
      }

      setError(null);
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files ? e.target.files[0] : null);
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
  }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    // This is a mock upload process.
    // In a real app, you would use fetch() to send the file to an API route
    // (e.g., '/api/upload') and handle storage (e.g., Vercel Blob, S3, Cloudinary).
    console.log('Uploading file:', file.name);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

    // On successful upload, you'd get a URL back from your API.
    const mockUrl = `https://cdn.example.com/${file.name}`;
    console.log('Mock upload successful:', mockUrl);

    setIsUploading(false);
    onUploadComplete(mockUrl);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-center">Upload New Image</h2>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input type="file" id="file-input" className="hidden" onChange={handleSelectFile} accept="image/*" />
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-md" />
          ) : (
            <p className="text-gray-500">Drag & drop an image here, or click to select one.</p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}