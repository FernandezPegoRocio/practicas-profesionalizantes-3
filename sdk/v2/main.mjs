import { createServer }  from 'node:http';
import { URL }           from 'node:url';
import { readFileSync }  from 'node:fs';
import { DatabaseSync }  from 'node:sqlite';
import { resolve }       from 'node:path';

import { login }    from './src/login.js';
import { register } from './src/register.js';
import { session_create, session_destroy,
         session_get, has_permission,
         token_from_request }             from './src/auth.js';

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
    try
    {
        const data = readFileSync('./config.json', 'utf-8');
        return JSON.parse(data);
    }
    catch (error)
    {
        return default_config();
    }
}

const config = load_config();

function connect_db(path)
{
    const db = new DatabaseSync(resolve(path));

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

    return db;
}

const db = connect_db(config.database.path);

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

async function login_handler(request, response)
{
    let body = '';
    for await (const chunk of request) body += chunk;

    const params = new URLSearchParams(body);
    const input  =
    {
        username: params.get('username'),
        password: params.get('password')
    };

    const output = login(db, input);

    if (!output.status)
    {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(output));
        return;
    }

    const token = session_create(output.result.id, output.result.username);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ ...output, token }));
}

async function logout_handler(request, response)
{
    const token = token_from_request(request);
    if (token) session_destroy(token);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: true }));
}

async function register_handler(request, response)
{
    if (request.method === 'POST')
    {
        try
        {
            let body = '';
            for await (const chunk of request) body += chunk;

            const params = new URLSearchParams(body);
            const input  =
            {
                username: params.get('username'),
                password: params.get('password')
            };

            const output = register(db, input.username, input.password);
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(output));
        }
        catch (err)
        {
            response.writeHead(500);
            response.end(JSON.stringify({ error: err.message }));
        }
    }
}

function check_access_handler(request, response)
{
    const token = token_from_request(request);

    if (!token)
    {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Token requerido' }));
        return;
    }

    const session = session_get(token);

    if (!session)
    {
        response.writeHead(401, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Sesión inválida' }));
        return;
    }

    const url  = new URL(request.url, 'http://' + config.server.ip);
    const path = url.searchParams.get('path');

    const allowed = has_permission(db, session.id_user, path);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ user: session.username, path, allowed }));
}

function show_message_handler(request, response)
{
    console.log('Petición recibida: Mostrando mensaje en el servidor!');
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Mensaje procesado' }));
}

let router = new Map();
router.set('/',            default_handler);
router.set('/login',       login_handler);
router.set('/logout',      logout_handler);
router.set('/register',    register_handler);
router.set('/checkAccess', check_access_handler);
router.set('/showMessage', show_message_handler);

async function request_dispatcher(request, response)
{
    const url  = new URL(request.url, 'http://' + config.server.ip);
    const path = url.pathname;

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
    console.log('Servidor ejecutándose...');
}

let server = createServer(request_dispatcher);
server.listen(config.server.port, config.server.ip, start);
