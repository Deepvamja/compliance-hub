import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useActivityLog() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activity_logs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        description: row.description,
        metadata: row.metadata,
        createdAt: row.created_at,
      }));
    },
    enabled: !!user,
  });
}
