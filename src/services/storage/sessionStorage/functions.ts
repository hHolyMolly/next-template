import { createWebStorage } from '@/services/storage/createWebStorage';

export const customSessionStorage = createWebStorage(() => window.sessionStorage);
