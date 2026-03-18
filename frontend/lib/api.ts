export async function apiFetch(path: string, options: RequestInit = {}) {
  // Alterado para passar pelo proxy do Next.js para suportar cookies httpOnly
  const url = path.startsWith('/api/') ? path : `/api/proxy${path.startsWith('/') ? path : `/${path}`}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // Se falhar o /me ou qualquer rota, limpa o cookie para parar o loop do Middleware
    if (typeof window !== 'undefined') {
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      window.location.href = '/login';
    }
    return null;
  }

  // Para 204 ou 304, se não houver corpo, o fetch lida com o cache automaticamente
  if (res.status === 204) return true;
  
  const data = await res.json().catch(() => null);
  return data;
}
