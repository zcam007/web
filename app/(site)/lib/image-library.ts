import { create } from 'zustand';

interface ImageLibraryState {
  images: string[];
  setImages: (images: string[]) => void;
  addImage: (image: string) => void;
}

export const useImageLibrary = create<ImageLibraryState>((set) => ({
  images: [],
  setImages: (images) => set({ images }),
  addImage: (image) => set((state) => ({ images: [image, ...state.images] })),
}));
