import React, { useState } from 'react';
import { Settings, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FamilySettingsMenuProps {
  familyId: string;
  currentPhotoLimit: number;
  currentSpeed: number;
  onUpdate: () => void;
  onClose: () => void;
}

export const FamilySettingsMenu: React.FC<FamilySettingsMenuProps> = ({
  familyId,
  currentPhotoLimit,
  currentSpeed,
  onUpdate,
  onClose,
}) => {
  const [photoLimit, setPhotoLimit] = useState(currentPhotoLimit.toString());
  const [slideshowSpeed, setSlideshowSpeed] = useState(currentSpeed.toString());
  const [familyPicture, setFamilyPicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFamilyPictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Family picture must be less than 5MB');
      return;
    }

    setFamilyPicture(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let pictureUrl = null;

      if (familyPicture) {
        const fileExt = familyPicture.name.split('.').pop();
        const fileName = `${familyId}-${Date.now()}.${fileExt}`;
        const filePath = `family-pictures/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, familyPicture);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        pictureUrl = publicUrl;
      }

      const updates: any = {
        slideshow_photo_limit: parseInt(photoLimit),
        slideshow_speed: parseInt(slideshowSpeed),
      };

      if (pictureUrl) {
        updates.family_picture = pictureUrl;
      }

      const { error } = await supabase
        .from('families')
        .update(updates)
        .eq('id', familyId);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating family settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Family Settings
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Family Picture
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFamilyPictureChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {familyPicture ? familyPicture.name : 'Choose a picture'}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Photos to Display
            </label>
            <select
              value={photoLimit}
              onChange={(e) => setPhotoLimit(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="10">10 photos</option>
              <option value="20">20 photos</option>
              <option value="30">30 photos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo Display Duration
            </label>
            <select
              value={slideshowSpeed}
              onChange={(e) => setSlideshowSpeed(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="10">10 seconds</option>
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};