export const onRequest = async ({ request, next, env }) => {
  const url = new URL(request.url);
  const path = url.pathname;

  const allow = ['/', '/index.html', '/login.html'];
  const staticPrefixes = ['/assets/', '/assetsdiff/', '/qr_files/', '/scanqr_files/', '/showqr_files/'];
  // Nazwy stron prywatnych (z i bez rozszerzenia .html)
  const protectedBase = new Set(['gen','card','home','qr','scanqr','showqr','services','more','moreid','pesel','shortcuts']);

  const isAllowed = allow.includes(path) || staticPrefixes.some(p => path.startsWith(p));
  if (isAllowed) return next();

  // ADMIN routes guard
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    // Allow admin login endpoint and admin landing without cookie
    const m = request.method.toUpperCase();
    const isAdminLogin = path === '/api/admin/login' && m === 'POST';
    const isAdminLanding = path === '/admin/index.html' && m === 'GET';
    if (!isAdminLogin && !isAdminLanding) {
      const cookiesAdmin = Object.fromEntries((request.headers.get('Cookie') || '')
        .split(';').map(c=>c.trim().split('=').map(decodeURIComponent)).filter(([k])=>k));
      const adminSid = cookiesAdmin.admin_sid;
      if (!adminSid) {
        // For API: return 401 JSON; for pages: redirect to admin login page
        if (path.startsWith('/api/')) {
          return new Response(JSON.stringify({ error: 'admin_unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        return Response.redirect(new URL('/admin/index.html', url), 302);
      }
    }
    return next();
  }

  // Normalizacja ścieżki: usuń trailing slash i wyciągnij nazwę bez rozszerzenia
  const normalized = path.endsWith('/') ? path.slice(0, -1) : path;
  const name = normalized.replace(/^\/+/, '').replace(/\.html$/i, '');
  const base = name.toLowerCase();

  // Jeśli nie jest to strona prywatna, przepuść
  if (!protectedBase.has(base)) return next();

  // Parse cookies
  const cookies = Object.fromEntries(
    (request.headers.get('Cookie') || '')
      .split(';')
      .map(c => c.trim().split('=').map(decodeURIComponent))
      .filter(([k]) => k)
  );
  const sid = cookies.sid;
  if (!sid) {
    return Response.redirect(new URL('/index.html', url), 302);
  }

  const key = `sess:${sid}`;
  const sess = await env.SESSIONS.get(key, { type: 'json' });
  if (!sess) {
    return Response.redirect(new URL('/index.html', url), 302);
  }

  // Sliding session: update lastSeen and refresh cookie
  sess.lastSeen = Date.now();
  await env.SESSIONS.put(key, JSON.stringify(sess));

  const res = await next();
  const headers = new Headers(res.headers);
  headers.append('Set-Cookie', `sid=${encodeURIComponent(sid)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=157680000`); // ~5 lat
  return new Response(res.body, { status: res.status, headers });
};
