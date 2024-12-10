import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface FamilyMember {
  id: string;
  name: string;
  avatar_url?: string;
  added_at: string;
  familyId: string;
}

interface Family {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
  display_name: string;
  color: string;
  family_picture: string | null;
}

export function useFamilyMembers() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFamilyData();

    const channel = supabase
      .channel('family_members_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'family_members' },
        () => {
          fetchFamilyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFamilyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's families
      const { data: familyMemberships, error: familyError } = await supabase
        .from('family_members')
        .select(`
          families (
            id,
            name,
            join_code,
            created_at,
            display_name,
            color,
            family_picture
          )
        `)
        .eq('user_id', user.id);

      if (familyError) throw familyError;

      const userFamilies = familyMemberships
        .map(fm => fm.families)
        .filter((f): f is Family => f !== null);

      setFamilies(userFamilies);

      // Get all members for all families
      const allMembers: FamilyMember[] = [];
      for (const family of userFamilies) {
        const { data: familyMembers, error: membersError } = await supabase
          .from('family_members')
          .select(`
            users (
              id,
              name,
              avatar_url
            ),
            added_at,
            family_id
          `)
          .eq('family_id', family.id);

        if (membersError) throw membersError;

        allMembers.push(...familyMembers.map(member => ({
          id: member.users.id,
          name: member.users.name,
          avatar_url: member.users.avatar_url,
          added_at: member.added_at,
          familyId: member.family_id
        })));
      }

      setMembers(allMembers);
    } catch (err) {
      console.error('Error fetching family data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  const updateFamilyPicture = async (familyId: string, pictureUrl: string) => {
    try {
      const { error } = await supabase
        .from('families')
        .update({ family_picture: pictureUrl })
        .eq('id', familyId);

      if (error) throw error;
      await fetchFamilyData();
    } catch (err) {
      console.error('Error updating family picture:', err);
      throw err;
    }
  };

  const copyJoinCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      return true;
    } catch (err) {
      console.error('Failed to copy code:', err);
      return false;
    }
  };

  return {
    families,
    members,
    loading,
    error,
    copyJoinCode,
    updateFamilyPicture,
    refreshData: fetchFamilyData,
  };
}