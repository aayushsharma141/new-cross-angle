import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryService, type GalleryItem, type GalleryCategory } from '@/services/GalleryService';

export function useGallery(categorySlug?: string) {
  return useQuery<GalleryItem[]>({
    queryKey: ['gallery', categorySlug],
    queryFn: () => galleryService.getGalleryItems(categorySlug),
  });
}

export function useGalleryCategories() {
  return useQuery<GalleryCategory[]>({
    queryKey: ['gallery-categories'],
    queryFn: () => galleryService.getCategories(),
  });
}

export function useCreateGalleryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: Partial<GalleryItem>) => galleryService.createGalleryItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useUpdateGalleryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<GalleryItem> }) => 
      galleryService.updateGalleryItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => galleryService.deleteGalleryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: Partial<GalleryCategory>) => galleryService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<GalleryCategory> }) => 
      galleryService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => galleryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}
