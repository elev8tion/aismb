'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import type { NCBListResponse, NCBSingleResponse } from '@/lib/types/api';
import { isDemoUser } from '@/lib/demo/session';

interface UserProfile {
  id: number;
  user_id: string;
  role: 'admin' | 'team_member' | 'customer';
  display_name: string | null;
  phone: string | null;
  timezone: string;
  notification_preferences: string | null;
  created_at: string;
  updated_at: string;
}

interface Permissions {
  isAdmin: boolean;
  isTeamMember: boolean;
  isCustomer: boolean;
  canManageUsers: boolean;
  canViewAllData: boolean;
  canEditSettings: boolean;
  canGrantAccess: boolean;
  canDeleteRecords: boolean;
  canExportData: boolean;
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'connect@elev8tion.one';

export function usePermissions() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (email?: string) => {
    try {
      const res = await fetch('/api/data/read/user_profiles', {
        credentials: 'include',
      });
      const data: NCBListResponse<UserProfile> = await res.json();

      if (data.data && data.data.length > 0) {
        setProfile(data.data[0]);
      } else {
        // Auto-create profile for first-time users
        const isFirstAdmin = email === ADMIN_EMAIL;
        const newProfile = await createProfile(email, isFirstAdmin ? 'admin' : 'customer');
        if (newProfile) {
          // Re-fetch to get the complete record
          const refetch = await fetch('/api/data/read/user_profiles', {
            credentials: 'include',
          });
          const refetchData: NCBListResponse<UserProfile> = await refetch.json();
          if (refetchData.data && refetchData.data.length > 0) {
            setProfile(refetchData.data[0]);
          } else {
            setProfile(newProfile);
          }
        }
      }
    } catch (err) {
      setError('Failed to fetch user profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProfile = async (
    email?: string,
    role: 'admin' | 'team_member' | 'customer' = 'customer'
  ): Promise<UserProfile | null> => {
    try {
      const res = await fetch('/api/data/create/user_profiles', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          display_name: email ? email.split('@')[0] : null,
          timezone: 'America/New_York',
        }),
      });
      const data: NCBSingleResponse<UserProfile> = await res.json();
      return data.data || null;
    } catch (err) {
      console.error('Error creating profile:', err);
      return null;
    }
  };

  useEffect(() => {
    if (isDemoUser(user)) {
      setProfile({
        id: 1,
        user_id: 'demo-user',
        role: 'team_member',
        display_name: 'KRE8TION Demo',
        phone: null,
        timezone: 'America/New_York',
        notification_preferences: null,
        created_at: '',
        updated_at: '',
      });
      setLoading(false);
      return;
    }
    if (user?.id) {
      setLoading(true);
      fetchProfile(user.email);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user?.id, user?.email, fetchProfile]);

  const role = isDemoUser(user) ? 'team_member' : profile?.role;
  const permissions: Permissions = {
    isAdmin: role === 'admin',
    isTeamMember: role === 'team_member',
    isCustomer: role === 'customer',
    canManageUsers: role === 'admin',
    canViewAllData: role === 'admin',
    canEditSettings: role === 'admin',
    canGrantAccess: role === 'admin',
    canDeleteRecords: role === 'admin',
    canExportData: role === 'admin' || role === 'team_member',
  };

  const refreshProfile = useCallback(() => {
    if (user?.id) {
      setLoading(true);
      fetchProfile(user.email);
    }
  }, [user?.id, user?.email, fetchProfile]);

  const profileMatchesUser = !user?.id || String(profile?.user_id) === String(user.id);

  return {
    profile,
    permissions,
    loading: isDemoUser(user) ? false : (loading || (!profileMatchesUser && !error)),
    error,
    refreshProfile,
    isAuthenticated: !!user,
  };
}
