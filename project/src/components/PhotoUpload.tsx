import React, { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { NewPost } from '../types';

interface PhotoUploadProps {
  onSubmit: (post: NewPost) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onSubmit }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preview && caption) {
      onSubmit({
        imageUrl: preview,
        caption,
      });
      setPreview(null);
      setCaption('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full aspect-square rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-gray-900/50 text-white p-2 rounded-full hover:bg-gray-900/75 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="block w-full aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <ImagePlus className="w-12 h-12 mb-2" />
              <span className="text-sm font-medium">Click to upload a photo</span>
            </div>
          </label>
        )}
      </div>

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption..."
        className="w-full p-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
        rows={3}
      />

      <button
        type="submit"
        disabled={!preview || !caption}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Share with Family
      </button>
    </form>
  );
};