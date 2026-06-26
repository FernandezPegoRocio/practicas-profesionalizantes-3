import { createServer } from 'node:http';
import { URL }          from 'node:url';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { resolve }      from 'node:path';
import { createHash }   from 'node:crypto';

function default_config()
{
    const config =
    {
        server:
        {
            ip:   '127.0.0.1',
            port: 8080
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
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT NOT NULL,
        password_hash TEXT NOT NULL
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

function hash_password(password)
{
    return createHash('sha256').update(password).digest('hex');
}

function seed()
{
    const count = db.prepare('SELECT COUNT(*) AS n FROM user').get().n;
    if (count > 0) return;

    db.prepare('INSERT INTO user (username, password_hash) VALUES (?, ?)').run('usuario_x', hash_password('1234'));

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

function authenticate(username, password_hash)
{
    const sql  = 'SELECT COUNT(*) AS total FROM user WHERE username = ? AND password_hash = ?';
    const stmt = db.prepare(sql);
    const row  = stmt.get(username, password_hash);
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

function login(username, password_hash)
{
    let isAuthenticated = authenticate(username, password_hash);

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

function logout(username, password_hash)
{
    let isAuthenticated = authenticate(username, password_hash);

    if (isAuthenticated)
    {
        let currentSession = userSessions.get(username);
        if (currentSession) currentSession.status = 'disabled';
    }
}

// ─── Lógica de negocio ────────────────────────────────────────────────────────

function createUser(username, password_hash)
{
    const sql  = 'INSERT INTO user (username, password_hash) VALUES (?, ?) RETURNING id';
    const stmt = db.prepare(sql);
    const row  = stmt.get(username, password_hash);
    return { id: row.id, username };
}

// ─── Helpers de respuesta ─────────────────────────────────────────────────────

function respond_ok(response, data)
{
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));
}

function respond_error(response, code, exception, detail)
{
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ exception, detail }));
}

// ─── Manejadores ──────────────────────────────────────────────────────────────

function login_handler(request, response)
{
    if (request.method !== 'POST')
    {
        respond_error(response, 400, 'BadRequest', ['Método no permitido. Usa POST.']);
        return;
    }

    const username      = request.headers['x-user-id'];
    const password_hash = request.headers['x-api-key'];

    if (!username || !password_hash)
    {
        respond_error(response, 400, 'BadRequest', ['Cabeceras x-user-id y x-api-key requeridas.']);
        return;
    }

    const session = login(username, password_hash);

    if (!session)
    {
        respond_error(response, 401, 'Unauthorized', ['Credenciales incorrectas.']);
        return;
    }

    respond_ok(response, { session });
}

function logout_handler(request, response)
{
    if (request.method !== 'POST')
    {
        respond_error(response, 400, 'BadRequest', ['Método no permitido. Usa POST.']);
        return;
    }

    const username      = request.headers['x-user-id'];
    const password_hash = request.headers['x-api-key'];

    if (!username || !password_hash)
    {
        respond_error(response, 400, 'BadRequest', ['Cabeceras x-user-id y x-api-key requeridas.']);
        return;
    }

    logout(username, password_hash);
    respond_ok(response, { status: true });
}

function register_handler(request, response)
{
    if (request.method !== 'POST')
    {
        respond_error(response, 400, 'BadRequest', ['Método no permitido. Usa POST.']);
        return;
    }

    const username      = request.headers['x-user-id'];
    const password_hash = request.headers['x-api-key'];

    if (!username || !password_hash)
    {
        respond_error(response, 400, 'BadRequest', ['Cabeceras x-user-id y x-api-key requeridas.']);
        return;
    }

    const output = createUser(username, password_hash);
    respond_ok(response, output);
}

function authorize_handler(request, response)
{
    if (request.method !== 'POST')
    {
        respond_error(response, 400, 'BadRequest', ['Método no permitido. Usa POST.']);
        return;
    }

    const username = request.headers['x-user-id'];

    if (!username)
    {
        respond_error(response, 400, 'BadRequest', ['Cabecera x-user-id requerida.']);
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

            if (!input.path)
            {
                respond_error(response, 400, 'BadRequest', ['El campo path es requerido en el cuerpo.']);
                return;
            }

            const session = userSessions.get(username);

            if (!session || session.status !== 'enabled')
            {
                respond_error(response, 401, 'Unauthorized', ['Sesión inactiva o inexistente.']);
                return;
            }

            const allowed = authorize(username, input.path);
            respond_ok(response, { username, path: input.path, allowed });
        }
        catch (err)
        {
            respond_error(response, 500, 'ServerError', [err.message]);
        }
    });
}

function showMessage_handler(request, response)
{
    if (request.method !== 'POST')
    {
        respond_error(response, 400, 'BadRequest', ['Método no permitido. Usa POST.']);
        return;
    }

    console.log('Petición recibida: Mostrando mensaje en el servidor!');
    respond_ok(response, { message: 'Mensaje procesado' });
}

// ─── Router ───────────────────────────────────────────────────────────────────

let router = new Map();
router.set('/login',       login_handler);
router.set('/logout',      logout_handler);
router.set('/register',    register_handler);
router.set('/authorize',   authorize_handler);
router.set('/showMessage', showMessage_handler);

async function request_dispatcher(request, response)
{
    // ── CORS ──────────────────────────────────────────────────────────────────
    response.setHeader('Access-Control-Allow-Origin',  '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id, x-api-key');
    response.setHeader('X-API-Version',                '1.0');

    if (request.method === 'OPTIONS')
    {
        response.writeHead(204);
        response.end();
        return;
    }

    try
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
            respond_error(response, 400, 'BadRequest', ['Ruta no encontrada: ' + path]);
        }
    }
    catch (err)
    {
        console.error(err);
        respond_error(response, 500, 'ServerError', [err.message]);
    }
}

function start()
{
    console.log('Servidor ejecutándose en http://' + config.server.ip + ':' + config.server.port);
}

let server = createServer(request_dispatcher);
server.listen(config.server.port, config.server.ip, start);
