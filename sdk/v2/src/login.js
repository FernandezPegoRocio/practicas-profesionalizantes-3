import { db } from './database.js';

export function login(input)
{
    const stmt = db.prepare(
        'SELECT id, username FROM user WHERE username = ? AND password = ?'
    );
    const user = stmt.get(input.username, input.password);

    if (!user)
    {
        return {
            status:      false,
            result:      null,
            description: 'INVALID_USER_PASS'
        };
    }

    return {
        status:      true,
        result:      { id: user.id, username: user.username },
        description: null
    };
}
