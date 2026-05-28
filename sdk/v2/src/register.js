import { db } from './database.js';

export function register(username, password)
{
    const stmt = db.prepare(
        'INSERT INTO user (username, password) VALUES (?, ?) RETURNING id'
    );
    const row = stmt.get(username, password);
    return { id: row.id, username };
}
