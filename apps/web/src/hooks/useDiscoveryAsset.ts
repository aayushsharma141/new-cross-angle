import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDiscoveryAsset(
  entityType: string,
  entityId: string,
  role: string,
  fallbackUrl = ''
): { url: string; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['dam', 'discovery-asset', entityType, entityId, role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_usages')
        .select('assets(url)')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('role', role)
        .maybeSingle();

      if (error || !data) return fallbackUrl;
      return (data.assets as unknown as { url: string } | null)?.url ?? fallbackUrl;
    },
    staleTime: 1000 * 60 * 5, // 5 min
    enabled: Boolean(entityType && entityId && role),
  });

  return { url: data ?? fallbackUrl, isLoading };
}
