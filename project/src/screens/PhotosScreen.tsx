import React, { useState } from 'react';
import { Users, Clock } from 'lucide-react';
import { MediaUpload } from '../components/MediaUpload';
import { ReminderSection } from '../components/ReminderSection';
import { usePosts } from '../hooks/usePosts';
import { useFamilies } from '../hooks/useFamilies';
import { Toast } from '../components/Toast';
import type { NewPost } from '../types';

export const PhotosScreen = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { createPost } = usePosts(null);
  const { families } = useFamilies();
  const [activeSection, setActiveSection] = useState<'photos' | 'reminders'>('photos');

  const handleMediaSubmit = async (newPost: NewPost, familyIds: string[]) => {
    try {
      setError(null);
      await createPost(newPost, familyIds);
      setSuccessMessage('Photo successfully shared with your family!');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
      throw err;
    }
  };

  const handleReminderSuccess = () => {
    setSuccessMessage('Reminder successfully added!');
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Section Toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveSection('photos')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            activeSection === 'photos'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users className="w-5 h-5" />
          Add Photos
        </button>
        <button
          onClick={() => setActiveSection('reminders')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            activeSection === 'reminders'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Clock className="w-5 h-5" />
          Add Reminders
        </button>
      </div>

      {/* Active Section Content */}
      {activeSection === 'photos' ? (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Share a Moment</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          <MediaUpload onSubmit={handleMediaSubmit} />
        </div>
      ) : (
        <ReminderSection 
          families={families} 
          onSuccess={handleReminderSuccess}
        />
      )}

      {/* Success Toast */}
      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
};