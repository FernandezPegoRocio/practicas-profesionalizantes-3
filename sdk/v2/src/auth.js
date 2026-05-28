import { db } from './database.js';

const sessions = new Map();   // username → { id_user, username, status }

export function session_create(id_user, username)
{
    const existing = sessions.get(username);

    if (existing == null)
    {
        sessions.set(username, { id_user, username, status: 'enabled' });
    }
    else
    {
        existing.status = 'enabled';
    }
}

export function session_get(username)
{
    return sessions.get(username) ?? null;
}

export function session_destroy(username)
{
    const session = sessions.get(username);
    if (session) session.status = 'disabled';
}

export function has_permission(id_user, path)
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