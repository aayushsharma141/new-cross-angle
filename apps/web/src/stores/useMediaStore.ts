import { create } from 'zustand';

interface MediaStoreState {
  currentFolderId: string | null;
  selectedFiles: string[];
  selectedFolders: string[];
  breadcrumbs: { id: string | null; name: string }[];
  isUploading: boolean;
  
  setCurrentFolderId: (id: string | null) => void;
  toggleFileSelection: (id: string) => void;
  toggleFolderSelection: (id: string) => void;
  clearSelection: () => void;
  setBreadcrumbs: (breadcrumbs: { id: string | null; name: string }[]) => void;
  setIsUploading: (status: boolean) => void;
  selectAllFiles: (fileIds: string[]) => void;
}

export const useMediaStore = create<MediaStoreState>((set) => ({
  currentFolderId: null,
  selectedFiles: [],
  selectedFolders: [],
  breadcrumbs: [{ id: null, name: 'Root' }],
  isUploading: false,

  setCurrentFolderId: (id) => set({ currentFolderId: id, selectedFiles: [], selectedFolders: [] }),
  
  toggleFileSelection: (id) => set((state) => ({
    selectedFiles: state.selectedFiles.includes(id)
      ? state.selectedFiles.filter((fileId) => fileId !== id)
      : [...state.selectedFiles, id]
  })),

  toggleFolderSelection: (id) => set((state) => ({
    selectedFolders: state.selectedFolders.includes(id)
      ? state.selectedFolders.filter((folderId) => folderId !== id)
      : [...state.selectedFolders, id]
  })),

  clearSelection: () => set({ selectedFiles: [], selectedFolders: [] }),
  
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

  setIsUploading: (status) => set({ isUploading: status }),

  selectAllFiles: (fileIds) => set({ selectedFiles: fileIds })
}));
