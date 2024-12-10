import React, { useState, useEffect } from 'react';
import { Settings, Copy, Check, Users, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FamilySettingsMenu } from '../components/FamilySettingsMenu';
import { MemberMenu } from '../components/MemberMenu';
import { Toast } from '../components/Toast';
import { SharedSidebar } from '../components/SharedSidebar';
import type { Family } from '../types';

interface FamilyMember {
  id: string;
  name: string;
  avatar_url?: string;
  added_at: string;
}

interface JoinScreenProps {
  onSuccess?: () => void;
}

export const JoinScreen: React.FC<JoinScreenProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'join' | 'create' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [members, setMembers] = useState<Record<string, FamilyMember[]>>({});
  const [copied, setCopied] = useState(false);
  
  const [familyName, setFamilyName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [color, setColor] = useState('#056aa0');
  const [joinCode, setJoinCode] = useState('');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: familyData, error: familyError } = await supabase
        .from('family_members')
        .select(`
          families (
            id,
            name,
            display_name,
            join_code,
            family_picture,
            slideshow_photo_limit,
            slideshow_speed
          )
        `)
        .eq('user_id', user.id);

      if (familyError) throw familyError;

      const userFamilies = familyData.map(item => ({
        ...item.families,
        display_name: item.families.display_name || item.families.name
      }));

      setFamilies(userFamilies);

      // Fetch members for each family
      for (const family of userFamilies) {
        const { data: membersData, error: membersError } = await supabase
          .from('family_members')
          .select(`
            users (
              id,
              name,
              avatar_url
            ),
            added_at
          `)
          .eq('family_id', family.id);

        if (membersError) throw membersError;

        setMembers(prev => ({
          ...prev,
          [family.id]: membersData.map(member => ({
            id: member.users.id,
            name: member.users.name,
            avatar_url: member.users.avatar_url,
            added_at: member.added_at
          }))
        }));
      }
    } catch (err) {
      console.error('Error fetching families:', err);
      setError(err instanceof Error ? err.message : 'Failed to load families');
    }
  };

  const handleRemoveMember = async (familyId: string, memberId: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', memberId);

      if (error) throw error;

      setMembers(prev => ({
        ...prev,
        [familyId]: prev[familyId].filter(member => member.id !== memberId)
      }));

      setSuccess('Member removed successfully');
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleSettingsClick = (familyId: string) => {
    setSelectedFamilyId(familyId);
    setShowSettings(true);
  };

  const handleSettingsUpdate = () => {
    fetchFamilies();
    setShowSettings(false);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  const handleFamilyChange = (id: string) => {
    setSelectedFamilyId(id);
    window.location.hash = `family/${id}`;
  };

  return (
    <>
      <SharedSidebar
        currentFamilyId={selectedFamilyId}
        onFamilyChange={handleFamilyChange}
        onJoinFamily={() => {}}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        currentPage="join"
      />
      
      <div className={`max-w-lg mx-auto p-4 transition-all duration-300 ${
        !isCollapsed ? 'pl-24' : ''
      }`}>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          {/* Existing Families */}
          {families.length > 0 && (
            <div className="mb-8 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Your Families
              </h3>
              {families.map(family => (
                <div key={family.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {family.family_picture ? (
                        <img
                          src={family.family_picture}
                          alt={family.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {family.display_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {members[family.id]?.length || 0} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSettingsClick(family.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200"
                        title="Family Settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleCopyCode(family.join_code)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span className="font-medium">{family.join_code}</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {members[family.id]?.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 bg-white rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {member.name}
                          </span>
                        </div>
                        <MemberMenu
                          onRemove={() => handleRemoveMember(family.id, member.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Join or Create Family */}
          {!mode ? (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full flex items-center justify-center gap-3 p-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Create a New Family</span>
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full flex items-center justify-center gap-3 p-4 bg-white text-primary-500 border-2 border-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Join Existing Family</span>
              </button>
            </div>
          ) : mode === 'create' ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Create a New Family
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Family Name
                  </label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter family name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name (optional)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Family Color
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-12 p-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMode(null)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {/* Handle create family */}}
                    className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Create Family
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Join a Family
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Family Join Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter family code"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMode(null)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {/* Handle join family */}}
                    className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Join Family
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showSettings && selectedFamilyId && (
          <FamilySettingsMenu
            familyId={selectedFamilyId}
            currentPhotoLimit={families.find(f => f.id === selectedFamilyId)?.slideshow_photo_limit || 30}
            currentSpeed={families.find(f => f.id === selectedFamilyId)?.slideshow_speed || 15}
            onUpdate={handleSettingsUpdate}
            onClose={handleSettingsClose}
          />
        )}

        {success && (
          <Toast
            message={success}
            type="success"
            onClose={() => setSuccess(null)}
          />
        )}
      </div>
    </>
  );
};