import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { StreakCard } from '../components/StreakCard';
import { NotificationBell } from '../components/NotificationBell';
import { Bell, LogOut, Loader2, Camera, Lock, User, X, Check, Settings, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Toast } from '../components/Toast';

export const ProfileScreen = () => {
  const { user, loading, error: authError, updateProfile, updatePassword, signOut } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be less than 5MB');
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      setSuccess('Profile photo updated successfully');
    } catch (err) {
      console.error('Error updating profile photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile photo');
    } finally {
      setUpdating(false);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setUpdating(true);
      setError(null);
      await updateProfile({ name: newName.trim() });
      setSuccess('Name updated successfully');
      setIsEditingName(false);
    } catch (err) {
      console.error('Error updating name:', err);
      setError(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setUpdating(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setUpdating(true);
      setError(null);
      await updateProfile({ email: newEmail.trim() });
      setSuccess('Email updated successfully');
      setIsEditingEmail(false);
    } catch (err) {
      console.error('Error updating email:', err);
      setError(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      await updatePassword(newPassword);
      setSuccess('Password updated successfully');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[calc(100vh-9rem)]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (authError || !user) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {authError || 'Please log in to view your profile'}
        </div>
      </div>
    );
  }

  const lastPostDate = user.last_post_date ? new Date(user.last_post_date) : null;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <button
                onClick={handlePhotoClick}
                className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 group-hover:border-white transition-all duration-300"
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100'}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            
            <div className="space-y-2">
              {isEditingName ? (
                <form onSubmit={handleNameSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    placeholder={user.name}
                    required
                  />
                  <button
                    type="submit"
                    disabled={updating}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setNewName(user.name);
                    setIsEditingName(true);
                  }}
                  className="text-2xl font-bold hover:text-white/90 flex items-center gap-2 transition-colors"
                >
                  {user.name}
                  <User className="w-5 h-5" />
                </button>
              )}

              {isEditingEmail ? (
                <form onSubmit={handleEmailSubmit} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    placeholder={user.email}
                    required
                  />
                  <button
                    type="submit"
                    disabled={updating}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setNewEmail(user.email);
                    setIsEditingEmail(true);
                  }}
                  className="text-lg text-white/80 flex items-center gap-2 hover:text-white transition-colors"
                >
                  {user.email}
                  <User className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <NotificationBell />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-white rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <Toast
            message={success}
            type="success"
            onClose={() => setSuccess(null)}
          />
        )}
      </div>

      {/* Streak Card */}
      <StreakCard
        streak={user.streak_count}
        lastPostDate={lastPostDate}
      />

      {/* Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Account Settings
            </h3>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Change Password</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-600">Sign Out</span>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications
            </h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">Daily reminders</span>
              </div>
              <div className="relative">
                {updating && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                  </div>
                )}
                <input
                  type="checkbox"
                  checked={user.notification_daily_reminder}
                  onChange={() => updateProfile({ notification_daily_reminder: !user.notification_daily_reminder })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">New content alerts</span>
              </div>
              <div className="relative">
                {updating && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                  </div>
                )}
                <input
                  type="checkbox"
                  checked={user.notification_new_content}
                  onChange={() => updateProfile({ notification_new_content: !user.notification_new_content })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">Streak alerts</span>
              </div>
              <div className="relative">
                {updating && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                  </div>
                )}
                <input
                  type="checkbox"
                  checked={user.notification_streak_alert}
                  onChange={() => updateProfile({ notification_streak_alert: !user.notification_streak_alert })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative animate-scale-up">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setNewPassword('');
                setConfirmPassword('');
                setError(null);
              }}
              className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Change Password
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={updating || !newPassword || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};