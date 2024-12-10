import React from 'react';
import { Users, Copy, Check } from 'lucide-react';
import { useFamilyMembers } from '../hooks/useFamilyMembers';

export const FamilyMembers = () => {
  const { family, members, loading, error, copyJoinCode } = useFamilyMembers();
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = async () => {
    if (!family?.join_code) return;
    
    const success = await copyJoinCode(family.join_code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  if (!family) {
    return (
      <div className="text-center text-gray-500">
        No family information available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Family Info */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {family.name}
        </h3>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          <span className="font-medium">{family.join_code}</span>
        </button>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            {member.profile_image ? (
              <img
                src={member.profile_image}
                alt={member.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-800">{member.name}</h4>
              <p className="text-xs text-gray-500">
                Joined {new Date(member.added_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}