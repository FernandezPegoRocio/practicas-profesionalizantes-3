import { DatabaseSync } from 'node:sqlite';
import { readFileSync }  from 'node:fs';
import { resolve }       from 'node:path';

function load_config()
{
    try   { return JSON.parse(readFileSync('./config.json', 'utf-8')); }
    catch { return { database: { path: './db.sqlite3' } }; }
}

const config = load_config();

export const db = new DatabaseSync(resolve(config.database.path));

db.exec(`
    CREATE TABLE IF NOT EXISTS user (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS "group" (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS members (
        id_user  INTEGER NOT NULL,
        id_group INTEGER NOT NULL,
        FOREIGN KEY (id_user)  REFERENCES user(id),
        FOREIGN KEY (id_group) REFERENCES "group"(id)
    );
    CREATE TABLE IF NOT EXISTS endpoint (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS access (
        id_group    INTEGER NOT NULL,
        id_endpoint INTEGER NOT NULL,
        FOREIGN KEY (id_group)    REFERENCES "group"(id),
        FOREIGN KEY (id_endpoint) REFERENCES endpoint(id)
    );
`);
