import React, { useState, useRef, useCallback } from 'react';
import { ImagePlus, Video, X, Loader2, ZoomIn, ZoomOut, Check, MoveVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useFamilies } from '../hooks/useFamilies';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import type { NewPost } from '../types';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MediaUploadProps {
  onSubmit: (post: NewPost, familyIds: string[]) => Promise<void>;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({ onSubmit }) => {
  const { families } = useFamilies();
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  
  // Cropping state
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isVertical, setIsVertical] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

  const handleMediaChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      setError('Please select an image or video file');
      return;
    }

    setFile(selectedFile);
    setMediaType(selectedFile.type.startsWith('video/') ? 'video' : 'image');
    setError(null);

    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);

    if (selectedFile.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        const vertical = img.height > img.width;
        setIsVertical(vertical);
        setIsCropping(true);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
      };
      img.src = previewUrl;
    }
  }, []);

  const handleFamilyToggle = (familyId: string) => {
    setSelectedFamilies(prev => 
      prev.includes(familyId)
        ? prev.filter(id => id !== familyId)
        : [...prev, familyId]
    );
  };

  const handleCropComplete = (_croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const toggleOrientation = () => {
    setIsVertical(prev => !prev);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleCropConfirm = async () => {
    if (!preview || !croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(
        preview,
        croppedAreaPixels,
        isVertical,
        file?.type || 'image/jpeg'
      );
      
      if (croppedImage) {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
        const newPreview = URL.createObjectURL(croppedImage);
        setPreview(newPreview);
        setFile(croppedImage);
      }
      
      setIsCropping(false);
    } catch (err) {
      console.error('Error cropping image:', err);
      setError('Failed to crop image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !caption.trim() || selectedFamilies.length === 0) {
      setError('Please fill in all required fields and select at least one family');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${timestamp}${isVertical ? '-vertical' : ''}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Add orientation metadata to URL
      const finalUrl = `${publicUrl}${isVertical ? '?orientation=vertical' : ''}`;

      await onSubmit({
        media_url: finalUrl,
        media_type: mediaType,
        caption: caption.trim()
      }, selectedFamilies);

      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);
      setCaption('');
      setSelectedFamilies([]);
      setFile(null);
      setIsCropping(false);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        {preview ? (
          <div className="relative">
            {mediaType === 'video' ? (
              <video
                src={preview}
                className="w-full aspect-[16/10] rounded-xl object-cover"
                controls
              />
            ) : isCropping ? (
              <div className={`relative ${isVertical ? 'aspect-[10/16]' : 'aspect-[16/10]'} rounded-xl overflow-hidden bg-black`}>
                <Cropper
                  image={preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={isVertical ? 10/16 : 16/10}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                  objectFit="contain"
                  restrictPosition={false}
                />
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/75 backdrop-blur-sm rounded-full p-2">
                  <button
                    type="button"
                    onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                    className="p-1.5 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-24"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                    className="p-1.5 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleOrientation}
                    className="p-1.5 text-white hover:bg-white/20 rounded-full transition-colors"
                    title="Toggle orientation"
                  >
                    <MoveVertical className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCropConfirm}
                  className="absolute top-4 right-4 z-10 bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <img
                src={preview}
                alt="Preview"
                className={`w-full ${isVertical ? 'aspect-[10/16]' : 'aspect-[16/10]'} rounded-xl object-cover`}
              />
            )}
            <button
              type="button"
              onClick={() => {
                if (preview) {
                  URL.revokeObjectURL(preview);
                }
                setPreview(null);
                setFile(null);
                setIsCropping(false);
                setZoom(1);
                setCrop({ x: 0, y: 0 });
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="absolute top-2 right-2 bg-gray-900/50 text-white p-2 rounded-full hover:bg-gray-900/75 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="block w-full aspect-[16/10] rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="hidden"
            />
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="flex gap-4 mb-2">
                <ImagePlus className="w-8 h-8" />
                <Video className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium">
                Click to upload a photo or video
              </span>
              <span className="text-xs text-gray-400 mt-1">
                Max size: 10MB
              </span>
            </div>
          </label>
        )}
      </div>

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption..."
        className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
        rows={3}
        required
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Share with families
        </label>
        <div className="space-y-2">
          {families.map((family) => (
            <label
              key={family.id}
              className="flex items-center p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedFamilies.includes(family.id)}
                onChange={() => handleFamilyToggle(family.id)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div className="ml-3">
                <span className="font-medium text-gray-700">{family.display_name || family.name}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || !caption.trim() || selectedFamilies.length === 0 || loading || isCropping}
        className="w-full bg-primary-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sharing...
          </>
        ) : (
          'Share with Family'
        )}
      </button>
    </form>
  );
};