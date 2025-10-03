'use client';

import { useState } from 'react';
import ImageUploader from './components/ImageUploader';

/**
 * Mock data for existing images.
 * In a real application, you would fetch this from your database.
 */
const existingImages = [
  { id: 1, url: 'https://via.placeholder.com/150', name: 'Engagement Photo 1' },
  { id: 2, url: 'https://via.placeholder.com/150', name: 'Venue Scenery' },
  { id: 3, url: 'https://via.placeholder.com/150', name: 'Happy Couple' },
];

export default function AdminPage() {
  const [showUploader, setShowUploader] = useState(false);

  const handleUploadComplete = (newImageUrl: string) => {
    console.log('Upload complete, new image at:', newImageUrl);
    // Here you would typically refetch your images or add the new one to the state
    setShowUploader(false);
  };

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setShowUploader(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Upload Image
        </button>
      </div>

      {showUploader && (
        <ImageUploader onUploadComplete={handleUploadComplete} onClose={() => setShowUploader(false)} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {existingImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={image.url} alt={image.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <p className="text-gray-800">{image.name}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}