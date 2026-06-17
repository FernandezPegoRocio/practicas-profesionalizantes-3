----------------------------------------------------------sdk_v3----------------------------------------------------------------------
Autenticador, Autorizador y Sesión — Node.js puro
Base: Código de clase del docente (14/5)
_____________________________________________________________IMPORTANTE______________________________________________________________
GET    --> Devuelve la vista principal (HTML) en la ruta /
        --> En la ruta /authorize verifica si el usuario tiene permiso sobre un path (requiere sesión activa)
        --> En la ruta /showMessage muestra un mensaje en el servidor
POST   --> En la ruta /login autentica contra la BD e inicia sesión
        --> En la ruta /logout cierra la sesión del usuario autenticado
        --> En la ruta /register registra un nuevo usuario en la base de datos
Se usa:
--- Módulo nativo node:http para crear el servidor
--- Objeto Map para asociar rutas con sus handlers
--- Módulo nativo node:sqlite para la conexión a SQLite
--- Archivo config.json para gestión de configuraciones
--- Map en memoria para gestión de sesiones (username → UserSession)
-----Lo que hace cada parte-----
main.mjs     : servidor, router, dispatcher, configuración, conexión a la BD, autenticador, autorizador, sesión y datos de prueba
config.json  : IP, puerto, ruta de la BD y ruta del HTML
default.html : vista principal con formulario de registro, login y dos botones del autorizador
package.json
.gitignore   : excluye node_modules y db.sqlite3
_______________________________________________________________CONSIGNA_______________________________________________________________
Ítems desarrollados:


1. Autorizador
   Escenario: usuario_x pertenece a grupo_g, que tiene acceso a /print /log /help
   sobre un total de 5 endpoints (/print /log /help /sayHello /sayBye).
   Backend: función authorize(username, endpointPath) que consulta la cadena
   members → access → endpoint y devuelve true o false.
   El authorize_handler verifica que exista una sesión activa antes de consultar
   el autorizador.
   Frontend: dos botones que ilustran cada caso.
   Ejecutar /log     → permitido  (grupo_g tiene acceso)
   Ejecutar /sayHello → denegado  (grupo_g no tiene acceso)


2. Mecanismo de sesión
   Clase UserSession con atributo status (enabled / disabled).
   Map userSessions con username como clave y UserSession como valor.
   login()  → autentica y crea o reactiva el objeto de sesión.
   logout() → autentica y deshabilita el objeto de sesión.
   La sesión no persiste en base de datos. Vive mientras el servidor esté corriendo.
   Habrá tantos objetos de sesión como usuarios hayan interactuado con el sistema.

3.Cifrado de contraseñas con SHA256
   El hash se calcula en el frontend usando crypto.subtle del browser.
   La contraseña en texto plano nunca llega al servidor.
   El frontend envía el campo password_hash con el resultado del algoritmo SHA256.
   El backend recibe el hash y lo compara directamente contra lo almacenado en la BD.
   La columna se renombró de password a password_hash para reflejar correctamente su contenido.

_______________________________________________________________AJUSTES________________________________________________________________
--- Se corrigió const db moviendola antes de las funciones que lo utilizan (authenticate, authorize, createUser).

--- Se corrigió createUser(): tenía db como parámetro innecesario y valores hardcodeados('test', '123456789'). Ahora recibe username y password desde el handler.

--- Se incorporó la función seed() que carga los datos de prueba al iniciar el servidor si la base de datos está vacía, sin necesidad de un archivo externo.

--- Se incorporó cifrado SHA256 de contraseñas

--- La función calcularHashSHA256() en default.html usa crypto.subtle para hashear

--- la contraseña antes de enviarla, tanto en el registro como en el login.

--- El backend no hashea: recibe y compara hash contra hash.

--- La columna password fue renombrada a password_hash en la tabla user.

_______________________________________________________________EJECUCIÓN______________________________________________________________
1. Abrir la terminal y navegar hasta la carpeta del proyecto:
      cd ruta/sdk/v3
2. Iniciar el servidor:
      node main.mjs
3. Abrir el navegador e ingresar a:
      http://127.0.0.1:3000
4. Iniciar sesión con el usuario de prueba:
      usuario: usuario_x     contraseña: 1234
5. Probar los botones del autorizador:
      Ejecutar /log      → usuario_x tiene permiso sobre /log
      Ejecutar /sayHello → usuario_x NO tiene permiso sobre /sayHello



