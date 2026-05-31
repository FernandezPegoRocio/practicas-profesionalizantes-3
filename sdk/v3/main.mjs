import { createServer } from 'node:http';
import { URL }          from 'node:url';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve }      from 'node:path';


function default_config()
{
    const config =
    {
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
    return config;
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


function seed()
{
    const count = db.prepare('SELECT COUNT(*) AS n FROM user').get().n;
    if (count > 0) return;


    db.prepare('INSERT INTO user (username, password) VALUES (?, ?)').run('usuario_x', '1234');


    db.prepare('INSERT INTO "group" (name) VALUES (?)').run('grupo_g');


    const user  = db.prepare('SELECT id FROM user WHERE username = ?').get('usuario_x');
    const group = db.prepare('SELECT id FROM "group" WHERE name = ?').get('grupo_g');
    db.prepare('INSERT INTO members (id_user, id_group) VALUES (?, ?)').run(user.id, group.id);


    const paths = ['/print', '/log', '/help', '/sayHello', '/sayBye'];
    const insert_ep = db.prepare('INSERT OR IGNORE INTO endpoint (path) VALUES (?)');
    for (const p of paths) insert_ep.run(p);


    const permitidos    = ['/print', '/log', '/help'];
    const insert_access = db.prepare('INSERT INTO access (id_group, id_endpoint) VALUES (?, ?)');
    for (const p of permitidos)
    {
        const ep = db.prepare('SELECT id FROM endpoint WHERE path = ?').get(p);
        insert_access.run(group.id, ep.id);
    }


    console.log('Datos de prueba cargados.');
    console.log('  Usuario: usuario_x / 1234');
    console.log('  Tiene permiso en:    /print  /log  /help');
    console.log('  No tiene permiso en: /sayHello  /sayBye');
}


seed();


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


function authorize(username, endpointPath)
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
    const row  = stmt.get(username, endpointPath);
    return row.total > 0;
}


// ─── Login / Logout ───────────────────────────────────────────────────────────


function login(username, password)
{
    let isAuthenticated = authenticate(username, password);


    if (isAuthenticated)
    {
        let havePreviousSession = userSessions.get(username);


        if (havePreviousSession == null)
        {
            let newSession    = new UserSession();
            newSession.status = 'enabled';
            userSessions.set(username, newSession);
            return newSession;
        }
        else
        {
            let previousSession = userSessions.get(username);
            if (previousSession.status === 'disabled')
            {
                previousSession.status = 'enabled';
            }
            return previousSession;
        }
    }
    else
    {
        return null;
    }
}


function logout(username, password)
{
    let isAuthenticated = authenticate(username, password);


    if (isAuthenticated)
    {
        let currentSession = userSessions.get(username);
        if (currentSession) currentSession.status = 'disabled';
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
            const output = createUser(params.get('username'), params.get('password'));
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



