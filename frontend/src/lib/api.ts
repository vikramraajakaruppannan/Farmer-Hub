// src/lib/api.ts
import { toast } from '@/hooks/use-toast';

export const api = async (url: string, init?: RequestInit) => {
  const normalSessionId = localStorage.getItem('session_id');
  const adminSessionId = localStorage.getItem('admin_session_id');

  const isAdminRoute = url.startsWith("/admin");
  const sessionId = isAdminRoute ? adminSessionId : normalSessionId;

  if (!sessionId) {
    localStorage.clear();
    toast({
      variant: 'destructive',
      title: 'Session Expired',
      description: 'Please log in again.',
    });
    window.location.href = '/login';
    throw new Error('no-session');
  }

  const headers = new Headers(init?.headers || {});

  // ALWAYS set JSON header for POST/PUT/PATCH
  if (init?.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('X-Session-ID', sessionId);

  const res = await fetch(`http://localhost:8000${url}`, { 
    ...init, 
    headers,
    credentials: 'include'
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.clear();
    toast({
      variant: 'destructive',
      title: 'Access Denied',
      description: 'Your session has expired or you lack permission.',
    });
    window.location.href = '/login';
    throw new Error('unauthorized');
  }

  return res;
};