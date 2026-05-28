import { db } from './database.js';

export function endpoint_create(path)
{
    const stmt = db.prepare(
        'INSERT INTO endpoint (path) VALUES (?) RETURNING id'
    );
    const row = stmt.get(path);
    return { id: row.id, path };
}

export function endpoint_read_all()
{
    return db.prepare('SELECT * FROM endpoint ORDER BY id').all();
}

export function endpoint_read_one(id)
{
    return db.prepare('SELECT * FROM endpoint WHERE id = ?').get(id) ?? null;
}

export function endpoint_update(id, path)
{
    const result = db.prepare('UPDATE endpoint SET path = ? WHERE id = ?').run(path, id);
    return { updated: result.changes > 0 };
}

export function endpoint_delete(id)
{
    db.prepare('DELETE FROM access WHERE id_endpoint = ?').run(id);
    const result = db.prepare('DELETE FROM endpoint WHERE id = ?').run(id);
    return { deleted: result.changes > 0 };
}
