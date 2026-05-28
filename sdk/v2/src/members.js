import { db } from './database.js';

export function member_create(id_user, id_group)
{
    const exists = db.prepare(
        'SELECT 1 FROM members WHERE id_user = ? AND id_group = ?'
    ).get(id_user, id_group);

    if (exists) return { error: 'El usuario ya pertenece a ese grupo.' };

    db.prepare('INSERT INTO members (id_user, id_group) VALUES (?, ?)').run(id_user, id_group);
    return { id_user, id_group };
}

export function member_read_all()
{
    return db.prepare(`
        SELECT m.id_user, u.username, m.id_group, g.name AS group_name
        FROM   members m
        JOIN   user    u ON u.id = m.id_user
        JOIN   "group" g ON g.id = m.id_group
        ORDER  BY m.id_group, m.id_user
    `).all();
}

export function member_delete(id_user, id_group)
{
    const result = db.prepare(
        'DELETE FROM members WHERE id_user = ? AND id_group = ?'
    ).run(id_user, id_group);
    return { deleted: result.changes > 0 };
}
