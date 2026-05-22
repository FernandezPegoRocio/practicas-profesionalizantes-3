import { createServer } from 'node:http';
import { URL }          from 'node:url';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve }      from 'node:path';

function default_config()
{
    return {
        server:
        {
            ip:           '127.0.0.1',
            port:         3000,
            default_path: './default.html'
        },
        database:
        {
            path: './db.sqlite3'
        }
    };
}

function load_config()
{
    let config = null;
    try
    {
        const data = readFileSync('./config.json', 'utf-8');
        config = JSON.parse(data);
        console.log('Configuración cargada correctamente.');
    }
    catch (error)
    {
        console.error('Error cargando config.json. Usando valores por defecto.');
        config = default_config();
    }
    return config;
}

const config = load_config();

function connect_db(path)
{
    const dbPath = resolve(path);
    try
    {
        const db = new DatabaseSync(dbPath);
        return db;
    }
    catch (err)
    {
        throw new Error('Error al conectar a la base de datos: ' + err.message);
    }
}

const db = connect_db(config.database.path);

// ==================== SEED (Datos iniciales) ====================
// Carga el escenario de la consigna:

// ←←← Se eliminaron los imports duplicados y las declaraciones duplicadas
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
        id_group INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS endpoint (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS access (
        id_group    INTEGER NOT NULL,
        id_endpoint INTEGER NOT NULL
    );
`);

db.exec(`
    DELETE FROM access;
    DELETE FROM members;
    DELETE FROM endpoint;
    DELETE FROM "group";
    DELETE FROM user;
`);

// Usuario de la consigna
db.prepare('INSERT INTO user (username, password) VALUES (?, ?)').run('usuario_x', '1234');

// Grupo G
db.prepare('INSERT INTO "group" (name) VALUES (?)').run('grupo_g');

// Asociar usuario al grupo
const user  = db.prepare('SELECT id FROM user  WHERE username = ?').get('usuario_x');
const group = db.prepare('SELECT id FROM "group" WHERE name   = ?').get('grupo_g');
db.prepare('INSERT INTO members (id_user, id_group) VALUES (?, ?)').run(user.id, group.id);

// 5 endpoints totales
const paths = ['/print', '/log', '/help', '/sayHello', '/sayBye'];
const insert_ep = db.prepare('INSERT OR IGNORE INTO endpoint (path) VALUES (?)');
for (const p of paths) insert_ep.run(p);

// Grupo G tiene acceso solo a /print /log /help
const permitidos = ['/print', '/log', '/help'];
const insert_access = db.prepare('INSERT INTO access (id_group, id_endpoint) VALUES (?, ?)');
for (const p of permitidos)
{
    const ep = db.prepare('SELECT id FROM endpoint WHERE path = ?').get(p);
    insert_access.run(group.id, ep.id);
}

const count = t => db.prepare(`SELECT COUNT(*) AS n FROM "${t}"`).get().n;
console.log('Seed completado:');
console.log('  Usuarios :', count('user'));
console.log('  Grupos   :', count('group'));
console.log('  Endpoints:', count('endpoint'));
console.log('  Miembros :', count('members'));
console.log('  Accesos  :', count('access'));
console.log('');
console.log('Usuario de prueba: usuario_x / 1234');
console.log('Tiene permiso en: /print /log /help');
console.log('No tiene permiso en: /sayHello /sayBye');

// ─── Objeto de sesión ─────────────────────────────────────────────────────────
let userSessions = new Map();   

class UserSession
{
    constructor()
    {
        this.status = 'disabled';
    }
}

// ─── Autenticador ─────────────────────────────────────────────────────────────
function authenticate(username, password)
{
    const sql  = 'SELECT COUNT(*) AS total FROM user WHERE username = ? AND password = ?';
    const stmt = db.prepare(sql);
    const row  = stmt.get(username, password);
    return row.total === 1;
}

// ─── Autorizador ──────────────────────────────────────────────────────────────
function authorize(username, endpoint_path)
{
    const sql = `
        SELECT COUNT(*) AS total
        FROM   access   a
        JOIN   members  m ON a.id_group    = m.id_group
        JOIN   user     u ON m.id_user     = u.id
        JOIN   endpoint e ON a.id_endpoint = e.id
        WHERE  u.username = ?
          AND  e.path     = ?
    `;
    const stmt = db.prepare(sql);
    const row  = stmt.get(username, endpoint_path);
    return row.total > 0;
}

// ─── Login / Logout ───────────────────────────────────────────────────────────
function login(username, password)
{
    const isAuthenticated = authenticate(username, password);
    if (!isAuthenticated) return null;
    const existing = userSessions.get(username);
    if (existing == null)
    {
        const newSession  = new UserSession();
        newSession.status = 'enabled';
        userSessions.set(username, newSession);
        return newSession;
    }
    else
    {
        existing.status = 'enabled';
        return existing;
    }
}

function logout(username, password)
{
    const isAuthenticated = authenticate(username, password);
    if (isAuthenticated)
    {
        const current = userSessions.get(username);
        if (current) current.status = 'disabled';
    }
}

// ─── Lógica de negocio ────────────────────────────────────────────────────────
function createUser(username, password)
{
    const sql  = 'INSERT INTO user (username, password) VALUES (?, ?) RETURNING id';
    const stmt = db.prepare(sql);
    const row  = stmt.get(username, password);
    return { id: row.id, username, password };
}

// ─── Manejadores ──────────────────────────────────────────────────────────────
function default_handler(request, response)
{
    try
    {
        const html = readFileSync(config.server.default_path, 'utf-8');
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(html);
    }
    catch (error)
    {
        response.writeHead(500);
        response.end('Error interno: No se pudo cargar la vista principal.');
    }
}

function login_handler(request, response)
{
    if (request.method !== 'POST')
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }
    let body = '';
    request.on('data', function(chunk)
    {
        body += chunk.toString();
    });
    request.on('end', function()
    {
        try
        {
            const input   = JSON.parse(body);
            const session = login(input.username, input.password);
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ session }));
        }
        catch (err)
        {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Formato JSON inválido' }));
        }
    });
}

function logout_handler(request, response)
{
    if (request.method !== 'POST')
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }
    let body = '';
    request.on('data', function(chunk)
    {
        body += chunk.toString();
    });
    request.on('end', function()
    {
        try
        {
            const input = JSON.parse(body);
            logout(input.username, input.password);
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ status: true }));
        }
        catch (err)
        {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ error: 'Formato JSON inválido' }));
        }
    });
}

function register_handler(request, response)
{
    if (request.method !== 'POST')
    {
        response.writeHead(405, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Método no permitido. Usa POST.' }));
        return;
    }
    let body = '';
    request.on('data', function(chunk)
    {
        body += chunk.toString();
    });
    request.on('end', function()
    {
        try
        {
            const params = new URLSearchParams(body);
            const input  =
            {
                username: params.get('username'),
                password: params.get('password')
            };
            const output = createUser(input.username, input.password);
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        }
        catch (err)
        {
            response.writeHead(500);
            response.end(JSON.stringify({ error: err.message }));
        }
    });
}

function authorize_handler(request, response)
{
    const url      = new URL(request.url, 'http://' + config.server.ip);
    const username = url.searchParams.get('username');
    const path     = url.searchParams.get('path');
    if (!username || !path)
    {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Parámetros username y path requeridos' }));
        return;
    }
    const session = userSessions.get(username);
    if (!session || session.status !== 'enabled')
    {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Sesión inactiva o inexistente' }));
        return;
    }
    const allowed = authorize(username, path);
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ username, path, allowed }));
}

function show_message_handler(request, response)
{
    console.log('Petición recibida: Mostrando mensaje en el servidor!');
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Mensaje procesado' }));
}

// ─── Router ───────────────────────────────────────────────────────────────────
let router = new Map();
router.set('/',            default_handler);
router.set('/login',       login_handler);
router.set('/logout',      logout_handler);
router.set('/register',    register_handler);
router.set('/authorize',   authorize_handler);
router.set('/showMessage', show_message_handler);

async function request_dispatcher(request, response)
{
    const url     = new URL(request.url, 'http://' + config.server.ip);
    const path    = url.pathname;
    const handler = router.get(path);
    if (handler)
    {
        return await handler(request, response);
    }
    else
    {
        response.writeHead(404);
        response.end('Método no encontrado');
    }
}

function start()
{
    console.log('Servidor ejecutándose en http://' + config.server.ip + ':' + config.server.port);
}

let server = createServer(request_dispatcher);
server.listen(config.server.port, config.server.ip, start);