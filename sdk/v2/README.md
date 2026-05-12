
----------------------------------------------------------sdk_v2----------------------------------------------------------------------

Módulo de autenticación y gestión de permisos — Node.js puro
Base: sdk/v1
_____________________________________________________________IMPORTANTE______________________________________________________________

GET    --> Devuelve la vista principal (HTML) en la ruta /
        --> En la ruta /checkAccess verifica si el usuario tiene permiso sobre un path (requiere token)
        --> En la ruta /showMessage muestra un mensaje en el servidor
POST   --> En la ruta /login autentica contra la BD y devuelve un token de sesión
        --> En la ruta /logout invalida la sesión activa
        --> En la ruta /register registra un nuevo usuario en la base de datos
Se usa:
--- Módulo nativo node:http para crear el servidor
--- Objeto Map para asociar rutas con sus handlers
--- Módulo nativo node:sqlite para la conexión a SQLite
--- Archivo config.json para gestión de configuraciones
--- Map en memoria para gestión de sesiones (token → { id_user, username })
-----Lo que hace cada parte-----
main.mjs     : servidor, router, dispatcher, configuración y conexión a la BD
config.json  : IP, puerto, ruta de la BD y ruta del HTML
default.html : vista principal con formulario de registro, login y verificación de permiso
seed.mjs     : script de inserción masiva de datos de prueba
src/
    login.js    : validación de credenciales contra la BD
    register.js : lógica de inserción de usuarios en la base de datos
    auth.js     : gestión de sesiones en memoria y verificación de permisos
package.json
.gitignore   : excluye node_modules y db.sqlite3
_______________________________________________________________AJUSTES________________________________________________________________

--- src/login.js fue reescrito para consultar la base de datos con parámetros preparados
    en lugar de comparar contra credenciales hardcodeadas.
    La firma de la función se mantuvo igual a v1.

--- Se incorporó src/auth.js con tres responsabilidades:
    Gestión de sesiones en memoria mediante un Map (session_create, session_get, session_destroy).
    Verificación de permisos consultando la cadena user → members → group → access → endpoint.
    Lectura del token desde el header Authorization: Bearer <token>.

--- En main.mjs se importa auth.js y se realizaron los siguientes cambios sobre la base de v1:
    El handler de /login genera un token al autenticar correctamente y lo devuelve en la respuesta.
    Se agregaron dos rutas nuevas: /logout y /checkAccess.
    El CREATE TABLE de connect_db fue extendido para crear las tablas group, members, endpoint
    y access si no existen, respetando el modelo de datos trabajado en clase.
    Todo lo demás se mantuvo igual a v1.

--- En default.html se sumaron debajo del formulario de registro existente:
    Un formulario de login con JavaScript que guarda el token en memoria al autenticar.
    Un formulario para verificar permisos que envía el token en el header Authorization.
    No se modificó la estructura original del archivo.

--- Se incorporó seed.mjs para inserción masiva de registros de prueba.
    Crea las tablas si no existen antes de insertar, por lo que puede ejecutarse
    sobre una base de datos nueva sin necesidad de correr main.mjs primero.
    Genera 30 usuarios, 3 grupos (admin, editor, viewer), 6 endpoints,
    asigna cada usuario a un grupo y define los accesos correspondientes por grupo.
    Se ejecuta una única vez antes de iniciar el servidor.
_______________________________________________________________EJECUCIÓN______________________________________________________________

1. Abrir la terminal y navegar hasta la carpeta del proyecto:
      cd ruta/sdk/v2
2. (Opcional) Ejecutar el seed para cargar datos de prueba:
      node seed.mjs
3. Iniciar el servidor:
      node main.mjs
4. Abrir el navegador e ingresar a:
      http://127.0.0.1:3000
5. Iniciar sesión con un usuario existente. Si se ejecutó el seed, por ejemplo:
      usuario: ana     contraseña: ana_pass2024
   El servidor responde con un token de sesión, por ejemplo:
      {"status":true,"result":{"id":1,"username":"ana"},"token":"a3f9z2x1..."}
