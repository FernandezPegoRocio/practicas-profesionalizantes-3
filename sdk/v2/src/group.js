import { db } from './database.js';

export function group_create(name)
{
    const stmt = db.prepare(
        'INSERT INTO "group" (name) VALUES (?) RETURNING id'
    );
    const row = stmt.get(name);
    return { id: row.id, name };
}

export function group_read_all()
{
    return db.prepare('SELECT * FROM "group" ORDER BY id').all();
}

export function group_read_one(id)
{
    return db.prepare('SELECT * FROM "group" WHERE id = ?').get(id) ?? null;
}

export function group_update(id, name)
{
    const result = db.prepare('UPDATE "group" SET name = ? WHERE id = ?').run(name, id);
    return { updated: result.changes > 0 };
}

export function group_delete(id)
{
    db.prepare('DELETE FROM members WHERE id_group = ?').run(id);
    db.prepare('DELETE FROM access  WHERE id_group = ?').run(id);
    const result = db.prepare('DELETE FROM "group" WHERE id = ?').run(id);
    return { deleted: result.changes > 0 };
}
