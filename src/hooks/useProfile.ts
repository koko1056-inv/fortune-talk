import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  birth_date: string | null;
  zodiac_sign: string | null;
  blood_type: string | null;
  created_at: string;
  updated_at: string;
}

// Calculate zodiac sign from birth date
export const calculateZodiacSign = (birthDate: string): string => {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "牡羊座";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "牡牛座";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "双子座";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "蟹座";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "獅子座";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "乙女座";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return "天秤座";
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "蠍座";
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "射手座";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "山羊座";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座";
  return "魚座";
};

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
};

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile = null, isLoading: loading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");

      // Auto-calculate zodiac sign if birth date is provided
      if (updates.birth_date) {
        updates.zodiac_sign = calculateZodiacSign(updates.birth_date);
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data && user) {
        queryClient.setQueryData(["profile", user.id], data);
      }
    },
  });

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      try {
        const data = await updateMutation.mutateAsync(updates);
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error as Error };
      }
    },
    [updateMutation]
  );

  const refetch = useCallback(() => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    }
  }, [queryClient, user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch,
  };
};
