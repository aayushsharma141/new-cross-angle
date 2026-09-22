import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export interface TransformationStory {
  id: string;
  title: string;
  location: string;
  beforeMedia: string;
  afterMedia: string;
  challenge: string;
  outcomeMetric: string;
}

interface TransformationStoryRow {
  id: string;
  title: string;
  location: string | null;
  before_media: string | null;
  after_media: string | null;
  challenge: string | null;
  outcome_metric: string | null;
}

/**
 * Active `transformation_stories` that have both a before and an after
 * image, in display order. The table is not in the generated types
 * (production-only, see ADR 0003), hence the manual row shape.
 */
export function useTransformationStories() {
  return useQuery({
    queryKey: queryKeys.transformationStories.active,
    queryFn: async (): Promise<TransformationStory[]> => {
      const { data, error } = await supabase
        .from("transformation_stories" as never)
        .select("id,title,location,before_media,after_media,challenge,outcome_metric")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (error || !data) return [];
      return (data as unknown as TransformationStoryRow[])
        .filter((row) => row.before_media && row.after_media)
        .map((row) => ({
          id: row.id,
          title: row.title,
          location: row.location ?? "",
          beforeMedia: row.before_media ?? "",
          afterMedia: row.after_media ?? "",
          challenge: row.challenge ?? "",
          outcomeMetric: row.outcome_metric ?? "",
        }));
    },
  });
}
