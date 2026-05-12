----------------------------------------------------------sdk_v1----------------------------------------------------------------------

Base de servidor web en Node.js
El objetivo es construir una base de servidor web utilizando Node.js puro (sin frameworks).
El sistema implementa un esquema de registro e inicio de sesión de usuarios.

______________________________________________________________IMPORTANTE______________________________________________________________

ET  --> Devuelve la vista principal (HTML) en la ruta /
     --> En la ruta /login valida credenciales y devuelve JSON
     --> En la ruta /showMessage muestra un mensaje en el servidor
POST --> En la ruta /register registra un nuevo usuario en la base de datos

Se usa:
--- Módulo nativo node:http para crear el servidor
--- Objeto Map para asociar rutas con sus handlers
--- Módulo nativo node:sqlite para la conexión a SQLite
--- Archivo config.json para gestión de configuraciones


-----Lo que hace cada parte-----

main.mjs     : servidor, router, dispatcher, configuración y conexión a la BD
config.json  : IP, puerto, ruta de la BD y ruta del HTML
default.html : vista principal con el formulario de registro
src/
    login.js    : lógica de validación de credenciales
    register.js : lógica de inserción de usuarios en la base de datos
package.json
.gitignore   : excluye node_modules y db.sqlite3

_______________________________________________________________AJUSTES________________________________________________________________

--- Las funciones login y register se separaron en la carpeta src
    Son funciones puras: no dependen de la infraestructura HTTP, solo reciben datos y devuelven resultados.
    
--- Se utiliza readFileSync para cargar config.json de forma sincrónica.
    En caso de que el archivo no exista, el sistema cuenta con una función default_config() que asigna valores predeterminados.
    
--- El handler de registro recibe los datos del formulario mediante el método POST.
    Lee el cuerpo de la petición acumulando chunks con el evento data y los parsea con URLSearchParams al recibir el evento end.
    
--- La inserción en la base de datos usa consultas parametrizadas con ?, para prevenir inyección SQL.

_______________________________________________________________EJECUCIÓN______________________________________________________________

1. Abrir la terminal y navegar hasta la carpeta del proyecto:
      cd ruta/sdk/v1
2. Iniciar el servidor:
      node main.mjs
3. Abrir el navegador e ingresar a:
      http://127.0.0.1:3000
4. Completar el formulario y hacer clic en Crear usuario.
   El servidor responde con un JSON confirmando el registro, por ejemplo:
      {"id":1,"username":"rocio","password":"1234"}
