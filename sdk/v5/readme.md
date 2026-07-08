----------------------------------------------------------sdk_v5----------------------------------------------------------------------
Base: sdk/v4
____________________________________________________CONSIGNA____________________________________________________________________
Condición: Se trabaja tomando lo realizado en sdk/v4

Esta versión comenzaremos a efectuar una refactorización progresiva de modo de converger a la integración final.

1. Adecuación del código frontend

Problema: Actualmente el código de frontend encuentra en reglas generales una gran cantidad de código repetitivo en cuanto a la 
realización de peticiones hacia la WebAPI. 

Solución: Dado que ahora nuestra WebAPI tiene decisiones de arquitectura sólidas que deberán mantenerse en todo el framework. 
Debemos encapsular y abstraer para poder empezar a simplificar código.

Consigna: Desarrollar una función async RPCWebAPIFetch( name, content ) que encapsule las peticiones realizadas con la función 
fetch, de modo tal que internamente se encargue de garantizar siempre que el envío de peticiones se haga por medio de POST, se 
trabaje con JSON en la entrada y salida de datos, y se procesen los estados de código de las respuestas especificadas en sdk/v4. 
A excepción del código de la categoría 200, todas las demás deberán lanzar excepciones de modo que el frontend pueda tomar 
decisiones visuales.

(Considerar el trabajo realizado en clase presencial para encarar la implementación)


2. WebComponents (Trabajo compartido con la materia Seminario de Actualización)Analice el código HTML/CSS/JS proporcionado a 
través del repositorio GitHub. Se trata de una plantilla que representa un prototipo de panel de interfaz gráfica basada en la 
librería CSS (W3Schools) para una aplicación genérica. Del repositorio adjuntado, deberá:
+Construir un WebComponent con nombre WCLoginFormView que encapsule el formulario LOGIN de la plantilla proporcionada. 
+Construir un WebComponent con nombre WCRegisterFormView que encapsule el formulario HORIZONTAL FORM de la plantilla.
En este punto, se solicitará la resolución de la actividad (Unidad 2 - Interfaces gráficas de aplicación (Parte I)) para quienes 
cursen Seminario de Actualización. Por lo tanto satisface ambas materias.
3. Refactorización final de arquitectura

Pendiente. Se definirá con el docente. 

4. Integración final

Una vez que el frontend basado en WebComponents del punto 2 esté completamente desarrollado y se haya finalizado con la refactorización 
final de arquitectura. Se efectuará la integración de las funcionalidades desarrolladas en sdk/v2 con respecto a la "Gestión de Usuarios, 
Grupos, Permisos" y "Login/Registro" de usuarios. 
Siempre que una petición mediante RPCWebAPIFetch arroje una excepción de tipo NotAuthorized/Unauthorized, el frontend deberá siempre vaciar 
as credenciales guardadas en la aplicación cliente y mostrar la pantalla de login. De igual manera cuando el usuario solicite un logout.
En la barra lateral izquierda, deberán colocarse los accesos a: 
-Gestión de usuarios y grupos   
-Control de accesos
En la barra superior se deberá inyectar en la sección superior derecha el acceso al cierre de sesión correspondiente.
Se deberá utilizar un logo institucional del ISFT 151 para la plantilla base terminada.
La plantilla deberá ser completamente funcional de los casos de uso presentados.


_____________________________________________________________IMPORTANTE______________________________________________________________
POST   
--> En la ruta /login autentica e inicia sesión
        --> En la ruta /logout cierra la sesión del usuario autenticado
        --> En la ruta /register registra un nuevo usuario en la base de datos
        --> En la ruta /authorize verifica si el usuario tiene permiso sobre un path
        --> En la ruta /showMessage muestra un mensaje en el servidor

Se usa:
--- Módulo nativo node:http para crear el servidor (puerto 8080)
--- Objeto Map para asociar rutas con sus handlers
--- Módulo nativo node:sqlite para la conexión a SQLite
--- Archivo config.json para gestión de configuraciones
--- Map en memoria para gestión de sesiones (username → UserSession)
--- Apache como servidor web estático para el frontend
--- Cabeceras x-user-id y x-api-key para autenticación
--- WebComponents nativos del browser (customElements API)

_______________________________________________________________AJUSTES________________________________________________________________
--- Se renombró RPCApiFetch a RPCWebAPIFetch(name, content).
    El parámetro name reemplaza a path y la URL se construye como dominio + '/' + name.

--- Se construyó WCLoginFormView que encapsula el formulario SIGN IN de la plantilla.
    Al confirmar emite el evento custom wc-login-submit con { username, password }.

--- Se construyó WCRegisterFormView que encapsula el HORIZONTAL FORM de la plantilla.
    Valida que las contraseñas coincidan antes de emitir.
    Al confirmar emite el evento custom wc-register-submit con { username, password }.

--- El index.html escucha los eventos de los componentes con document.addEventListener,
    calcula el hash SHA256 y llama a RPCWebAPIFetch.
    Los WebComponents no conocen la lógica de red.
_______________________________________________________________EJECUCIÓN______________________________________________________________
1. Iniciar el backend:
      cd ruta/sdk/v5/backend
      node main.mjs
2. Copiar el contenido de sdk/v5/frontend en la carpeta www de Apache.
3. Abrir el navegador en:
      http://localhost
4. Iniciar sesión con el usuario de prueba:
      usuario: usuario_x     contraseña: 1234
5. Probar los botones del autorizador:
      Ejecutar /log      → usuario_x tiene permiso sobre /log
      Ejecutar /sayHello → usuario_x NO tiene permiso sobre /sayHello

