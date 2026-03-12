import { createWebStorage } from '@/services/storage/createWebStorage';

export const customLocalStorage = createWebStorage(() => window.localStorage);
