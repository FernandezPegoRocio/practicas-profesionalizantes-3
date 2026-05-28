import { createServer } from 'node:http';
import { URL }          from 'node:url';
import { readFileSync } from 'node:fs';

import './src/database.js';

import { login }                                          from './src/login.js';
import { register }                                       from './src/register.js';
import { session_create, session_get,
         session_destroy, has_permission }                from './src/auth.js';
import { user_create, user_read_all,
         user_read_one, user_update, user_delete }        from './src/user.js';
import { group_create, group_read_all,
         group_read_one, group_update, group_delete }     from './src/group.js';
import { endpoint_create, endpoint_read_all,
         endpoint_read_one, endpoint_update,
         endpoint_delete }                                from './src/endpoint.js';
import { member_create, member_read_all,
         member_delete }                                  from './src/members.js';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json_ok(response, data)
{
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));
}

function json_err(response, code, message)
{
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: message }));
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
        json_err(response, 405, 'Método no permitido.');
        return;
    }

    let body = '';

    request.on('data', function(chunk)
    {
        body += chunk.toString();
    });

    request.on('end', function()
    {
        const params = new URLSearchParams(body);
        const input  =
        {
            username: params.get('username'),
            password: params.get('password')
        };

        const output = login(input);

        if (!output.status)
        {
            json_ok(response, output);
            return;
        }

        session_create(output.result.id, output.result.username);
        json_ok(response, output);
    });
}

function logout_handler(request, response)
{
    if (request.method !== 'POST')
    {
        json_err(response, 405, 'Método no permitido.');
        return;
    }

    let body = '';

    request.on('data', function(chunk)
    {
        body += chunk.toString();
    });

    request.on('end', function()
    {
        const params   = new URLSearchParams(body);
        const username = params.get('username');
        session_destroy(username);
        json_ok(response, { status: true });
    });
}

function register_handler(request, response)
{
    if (request.method !== 'POST')
    {
        json_err(response, 405, 'Método no permitido.');
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
            const output = register(params.get('username'), params.get('password'));
            json_ok(response, output);
        }
        catch (err)
        {
            json_err(response, 500, err.message);
        }
    });
}

function check_access_handler(request, response)
{
    const url      = new URL(request.url, 'http://' + config.server.ip);
    const username = url.searchParams.get('username');
    const path     = url.searchParams.get('path');

    if (!username || !path)
    {
        json_err(response, 400, 'Parámetros username y path requeridos.');
        return;
    }

    const session = session_get(username);

    if (!session || session.status !== 'enabled')
    {
        json_err(response, 401, 'Sesión inactiva o inexistente.');
        return;
    }

    const allowed = has_permission(session.id_user, path);
    json_ok(response, { user: username, path, allowed });
}

// ─── ABM usuarios ─────────────────────────────────────────────────────────────

function users_handler(request, response)
{
    if (request.method === 'GET')
    {
        const url = new URL(request.url, 'http://' + config.server.ip);
        const id  = url.searchParams.get('id');
        return json_ok(response, id ? user_read_one(id) : user_read_all());
    }

    let body = '';
    request.on('data', function(chunk) { body += chunk.toString(); });
    request.on('end', function()
    {
        try
        {
            const p = new URLSearchParams(body);
            if (request.method === 'POST')
                return json_ok(response, user_create(p.get('username'), p.get('password')));
            if (request.method === 'PUT')
                return json_ok(response, user_update(p.get('id'), p.get('username'), p.get('password')));
            if (request.method === 'DELETE')
                return json_ok(response, user_delete(p.get('id')));
            json_err(response, 405, 'Método no permitido.');
        }
        catch (err) { json_err(response, 500, err.message); }
    });
}

// ─── ABM grupos ───────────────────────────────────────────────────────────────

function groups_handler(request, response)
{
    if (request.method === 'GET')
    {
        const url = new URL(request.url, 'http://' + config.server.ip);
        const id  = url.searchParams.get('id');
        return json_ok(response, id ? group_read_one(id) : group_read_all());
    }

    let body = '';
    request.on('data', function(chunk) { body += chunk.toString(); });
    request.on('end', function()
    {
        try
        {
            const p = new URLSearchParams(body);
            if (request.method === 'POST')
                return json_ok(response, group_create(p.get('name')));
            if (request.method === 'PUT')
                return json_ok(response, group_update(p.get('id'), p.get('name')));
            if (request.method === 'DELETE')
                return json_ok(response, group_delete(p.get('id')));
            json_err(response, 405, 'Método no permitido.');
        }
        catch (err) { json_err(response, 500, err.message); }
    });
}

// ─── ABM endpoints ────────────────────────────────────────────────────────────

function endpoints_handler(request, response)
{
    if (request.method === 'GET')
    {
        const url = new URL(request.url, 'http://' + config.server.ip);
        const id  = url.searchParams.get('id');
        return json_ok(response, id ? endpoint_read_one(id) : endpoint_read_all());
    }

    let body = '';
    request.on('data', function(chunk) { body += chunk.toString(); });
    request.on('end', function()
    {
        try
        {
            const p = new URLSearchParams(body);
            if (request.method === 'POST')
                return json_ok(response, endpoint_create(p.get('path')));
            if (request.method === 'PUT')
                return json_ok(response, endpoint_update(p.get('id'), p.get('path')));
            if (request.method === 'DELETE')
                return json_ok(response, endpoint_delete(p.get('id')));
            json_err(response, 405, 'Método no permitido.');
        }
        catch (err) { json_err(response, 500, err.message); }
    });
}

// ─── ABM miembros ─────────────────────────────────────────────────────────────

function members_handler(request, response)
{
    if (request.method === 'GET')
        return json_ok(response, member_read_all());

    let body = '';
    request.on('data', function(chunk) { body += chunk.toString(); });
    request.on('end', function()
    {
        try
        {
            const p = new URLSearchParams(body);
            if (request.method === 'POST')
                return json_ok(response, member_create(p.get('id_user'), p.get('id_group')));
            if (request.method === 'DELETE')
                return json_ok(response, member_delete(p.get('id_user'), p.get('id_group')));
            json_err(response, 405, 'Método no permitido.');
        }
        catch (err) { json_err(response, 500, err.message); }
    });
}

function show_message_handler(request, response)
{
    console.log('Petición recibida: Mostrando mensaje en el servidor!');
    json_ok(response, { message: 'Mensaje procesado' });
}

// ─── Router ───────────────────────────────────────────────────────────────────

let router = new Map();
router.set('/',            default_handler);
router.set('/login',       login_handler);
router.set('/logout',      logout_handler);
router.set('/register',    register_handler);
router.set('/checkAccess', check_access_handler);
router.set('/users',       users_handler);
router.set('/groups',      groups_handler);
router.set('/endpoints',   endpoints_handler);
router.set('/members',     members_handler);
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
    console.log('Servidor ejecutándose...');
}

let server = createServer(request_dispatcher);
server.listen(config.server.port, config.server.ip, start);
