import { db } from './database.js';

export function user_create(username, password)
{
    const stmt = db.prepare(
        'INSERT INTO user (username, password) VALUES (?, ?) RETURNING id'
    );
    const row = stmt.get(username, password);
    return { id: row.id, username };
}

export function user_read_all()
{
    return db.prepare('SELECT id, username FROM user ORDER BY id').all();
}

export function user_read_one(id)
{
    return db.prepare('SELECT id, username FROM user WHERE id = ?').get(id) ?? null;
}

export function user_update(id, username, password)
{
    const result = db.prepare(
        'UPDATE user SET username = ?, password = ? WHERE id = ?'
    ).run(username, password, id);
    return { updated: result.changes > 0 };
}

export function user_delete(id)
{
    db.prepare('DELETE FROM members WHERE id_user = ?').run(id);
    const result = db.prepare('DELETE FROM user WHERE id = ?').run(id);
    return { deleted: result.changes > 0 };
}
