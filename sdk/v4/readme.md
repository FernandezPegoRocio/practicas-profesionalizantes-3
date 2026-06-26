----------------------------------------------------------sdk_v4----------------------------------------------------------------------
Refactorización de arquitectura — Node.js puro + Apache

Base: sdk/v3

_____________________________________________________________IMPORTANTE______________________________________________________________

POST   
--> En la ruta /login autentica e inicia sesión
--> En la ruta /logout cierra la sesión del usuario autenticado
--> En la ruta /register registra un nuevo usuario en la base de datos
--> En la ruta /authorize verifica si el usuario tiene permiso sobre un path
--> En la ruta /showMessage muestra un mensaje en el servidor

Se usa:
--- Módulo nativo node: http para crear el servidor (en el puerto 8080)
--- Objeto Map para asociar rutas con sus handlers
--- Módulo nativo node: sqlite para la conexión a SQLite
--- Archivo config.json para gestión de configuraciones
--- Map en memoria para gestión de sesiones (username –> UserSession)
--- Módulo nativo node:  crypto para hash SHA256 en el seed
--- Apache como servidor web estático (en el puerto 8081) para el frontend
--- Cabeceras x-user-id y x-api-key para autenticación en todas las peticiones

-----Lo que hace cada parte-----
— backend/ — 

+ main.mjs   : se encarga del servidor, router, dispatcher, configuración, conexión a la BD, autenticador, autorizador, sesión, datos 
de  prueba y cabeceras CORS

+ config.json: se encarga de la IP, puerto 8080 y ruta de la BD

+ package.json

+ .gitignore : excluye node_modules y db.sqlite3

— frontend/ —

+ index.html : se encarga de la interfaz gráfica con formularios de registro, login y autorizador
_______________________________________________________________CONSIGNA_______________________________________________________________

Puntos desarrollados:

1. Desacoplamiento frontend / backend
--- el frontend se sirve desde Apache en un puerto diferente.
--- Backend NodeJS corre en localhost:8080

 Frontend Apache corre en localhost:8081
--- Se agregaron cabeceras CORS en request_dispatcher para permitir
--- peticiones cruzadas entre puertos:
    Access-Control-Allow-Origin: *
    Access-Control-Allow-Methods: GET, POST, OPTIONS

2. Desacoplamiento del autenticador
--- Los datos de autenticación viajan en cabeceras HTTP separadas:
       x-user-id: username
       x-api-key: password_hash
--- El cuerpo de cada petición queda exclusivamente para los datos del caso de uso.
--- Se agregó la cabecera CORS:
       Access-Control-Allow-Headers: Content-Type, x-user-id, x-api-key
---El frontend almacena userId y key en memoria y los incluye en todas las peticiones a través de getRpcApiHeaders().

3. Uniformización RPC
---Se adoptó el estilo RPC con las siguientes reglas:
+ Toda la información viaja por POST sin excepción.
+ Los cuerpos se serializan siempre en JSON.
+ Los paths están escritos en camelCase.

---- Se adoptaron los siguientes códigos de estado:
+ 200: petición válida y procesada satisfactoriamente
+ 400: error de uso en la especificación (cuerpo mal formado, ruta inválida)
+ 401: error por falta de permisos
+ 422: error del dominio de la aplicación
+ 500: error al procesar la solicitud (excepciones, fallas internas)
   
---Los errores devuelven siempre: { exception: 'value', detail: [a,b,c] }
 
+ Se agregó la cabecera X-API-Version   
+ Se agregaron helpers respond_ok() y respond_err() para unificar respuestas.
+ El request_dispatcher tiene try/catch global que captura cualquier error no contemplado y responde con 500.
+ Del lado del frontend se implementaron clases de excepción que heredan de Error, una por categoría de error:
       SpecificationError  → código 400
       UnauthorizedError   → código 401
       DomainError         → código 422
       ServerError         → código 500

+ La función RPCApiFetch(path, input) centraliza todas las peticiones, analiza el código de estado de la
  respuesta y lanza la excepción correspondiente.
+ El código de uso decide qué hacer con cada error.
+ La función getPrcaDominio() centraliza la URL base del backend.
+ La función getRpcApiHeaders() arma los headers de cada petición.


_______________________________________________________________EJECUCIÓN______________________________________________________________
1. Iniciar el backend:
      cd ruta/sdk/v4/backend
      node main.mjs
2. Colocar el contenido de sdk/v4/frontend en la carpeta raíz de Apache. (En mi caso uso uniserver, el contenido fue a la carpeta www)
3. Iniciar Apache y abrir el navegador en:
      http://localhost
4. Iniciar sesión con el usuario de prueba:
      usuario: usuario_x     contraseña: 1234
5. Probar los botones del autorizador:
      Ejecutar /log     -> usuario_x tiene permiso sobre /log
      Ejecutar /sayHello -> usuario_x NO tiene permiso sobre /sayHello
