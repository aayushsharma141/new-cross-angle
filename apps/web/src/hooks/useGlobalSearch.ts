import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGlobalSearch() {
    const { data: pages, isLoading: isLoadingPages } = useQuery({
        queryKey: ["global-search-pages"],
        queryFn: async () => {
            const { data, error } = await supabase.from("pages").select("id, title, slug");
            if (error) throw error;
            return data || [];
        },
    });

    const { data: blogs, isLoading: isLoadingBlogs } = useQuery({
        queryKey: ["global-search-blogs"],
        queryFn: async () => {
            const { data, error } = await supabase.from("blogs").select("id, title, slug, status");
            if (error) throw error;
            return data || [];
        },
    });

    const { data: projects, isLoading: isLoadingProjects } = useQuery({
        queryKey: ["global-search-projects"],
        queryFn: async () => {
            const { data, error } = await supabase.from("projects").select("id, title, slug, category_id");
            if (error) throw error;
            return data || [];
        },
    });

    const { data: media, isLoading: isLoadingMedia } = useQuery({
        queryKey: ["global-search-media"],
        queryFn: async () => {
            const { data, error } = await supabase.from("media").select("id, file_name, file_type");
            if (error) throw error;
            return data || [];
        },
    });

    return {
        pages: pages || [],
        blogs: blogs || [],
        projects: projects || [],
        media: media || [],
        isLoading: isLoadingPages || isLoadingBlogs || isLoadingProjects || isLoadingMedia,
    };
}
