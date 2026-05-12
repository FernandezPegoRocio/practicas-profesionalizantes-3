import { DatabaseSync } from 'node:sqlite';
import { resolve }      from 'node:path';
import { readFileSync } from 'node:fs';

function load_config()
{
    try   { return JSON.parse(readFileSync('./config.json', 'utf-8')); }
    catch { return { database: { path: './db.sqlite3' } }; }
}

const config = load_config();
const db     = new DatabaseSync(resolve(config.database.path));

// Crear tablas si no existen
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

// Limpiar datos anteriores
db.exec(`
    DELETE FROM access;
    DELETE FROM members;
    DELETE FROM endpoint;
    DELETE FROM "group";
    DELETE FROM user;
`);

// Usuarios
const usuarios = [
    'ana','bruno','carla','diego','elena','fabian','gabriela','hector',
    'irene','jorge','karina','lucas','marta','nicolas','olivia','pablo',
    'quintina','roberto','sofia','tomas','ursula','victor','wendy','xavier',
    'yolanda','zoe','agustin','beatriz','cesar','daniela'
];

const insert_user = db.prepare('INSERT INTO user (username, password) VALUES (?, ?)');
for (const u of usuarios) insert_user.run(u, u + '_pass2024');

// Grupos
const grupos = ['admin', 'editor', 'viewer'];
const insert_group = db.prepare('INSERT OR IGNORE INTO "group" (name) VALUES (?)');
for (const g of grupos) insert_group.run(g);

// Endpoints
const paths = ['/', '/login', '/logout', '/register', '/checkAccess', '/showMessage'];
const insert_ep = db.prepare('INSERT OR IGNORE INTO endpoint (path) VALUES (?)');
for (const p of paths) insert_ep.run(p);

// Membresías
const all_users  = db.prepare('SELECT id FROM user').all();
const all_groups = db.prepare('SELECT id FROM "group"').all();
const insert_member = db.prepare('INSERT INTO members (id_user, id_group) VALUES (?, ?)');
for (const u of all_users)
{
    const g = all_groups[u.id % all_groups.length];
    insert_member.run(u.id, g.id);
}

// Accesos por grupo
const all_eps   = db.prepare('SELECT id, path FROM endpoint').all();
const ep        = (p) => all_eps.find(e => e.path === p)?.id;
const get_group = db.prepare('SELECT id FROM "group" WHERE name = ?');

const insert_access = db.prepare('INSERT INTO access (id_group, id_endpoint) VALUES (?, ?)');

const permisos =
{
    admin:  ['/', '/login', '/logout', '/register', '/checkAccess', '/showMessage'],
    editor: ['/', '/login', '/logout', '/checkAccess'],
    viewer: ['/', '/login', '/logout']
};

for (const [name, rutas] of Object.entries(permisos))
{
    const g = get_group.get(name);
    for (const r of rutas) insert_access.run(g.id, ep(r));
}

const count = t => db.prepare(`SELECT COUNT(*) AS n FROM "${t}"`).get().n;
console.log('Seed completado:');
console.log('  Usuarios :', count('user'));
console.log('  Grupos   :', count('group'));
console.log('  Endpoints:', count('endpoint'));
console.log('  Miembros :', count('members'));
console.log('  Accesos  :', count('access'));

