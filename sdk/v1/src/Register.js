
export function register(db, username, password)
{
    const stmt = db.prepare(
        'INSERT INTO user (username, password) VALUES (?, ?) RETURNING id'
    );
    const row = stmt.get(username, password);

    return { id: row.id, username, password };
}