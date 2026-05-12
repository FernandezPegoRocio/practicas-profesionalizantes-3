const sessions = new Map();   // token ---> { id_user, username }

export function session_create(id_user, username)
{
    const token = Math.random().toString(36).slice(2)
                + Math.random().toString(36).slice(2);
    sessions.set(token, { id_user, username });
    return token;
}

export function session_get(token)
{
    return sessions.get(token) ?? null;
}

export function session_destroy(token)
{
    return sessions.delete(token);
}

export function has_permission(db, id_user, path)
{
    const stmt = db.prepare(`
        SELECT COUNT(*) AS cnt
        FROM   members  m
        JOIN   access   a ON a.id_group    = m.id_group
        JOIN   endpoint e ON e.id          = a.id_endpoint
        WHERE  m.id_user = ?
          AND  e.path    = ?
    `);
    const row = stmt.get(id_user, path);
    return row.cnt > 0;
}

export function token_from_request(request)
{
    const header = request.headers['authorization'] ?? '';
    const parts  = header.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') return parts[1];
    return null;
}
