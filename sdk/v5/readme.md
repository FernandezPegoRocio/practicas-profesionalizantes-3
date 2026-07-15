----------------------------------------------------------sdk_v5----------------------------------------------------------------------

Base: sdk/v4
Condición: Se trabaja tomando lo realizado en sdk/v4

Esta versión comenzaremos a efectuar una refactorización progresiva de modo de converger a la integración final.

1. Adecuación del código frontend_____________________________________

Problema: Actualmente el código de frontend encuentra en reglas generales una gran cantidad de código repetitivo en cuanto a la realización de peticiones hacia la WebAPI. 

Solución: Dado que ahora nuestra WebAPI tiene decisiones de arquitectura sólidas que deberán mantenerse en todo el framework. Debemos encapsular y abstraer para poder empezar a simplificar código.

Consigna: Desarrollar una función async RPCWebAPIFetch( name, content ) que encapsule las peticiones realizadas con la función fetch, de modo tal que internamente se encargue de garantizar siempre que el envío de peticiones se haga por medio de POST, se trabaje con JSON en la entrada y salida de datos, y se procesen los estados de código de las respuestas especificadas en sdk/v4. A excepción del código de la categoría 200, todas las demás deberán lanzar excepciones de modo que el frontend pueda tomar decisiones visuales.

(Considerar el trabajo realizado en clase presencial para encarar la implementación)


2. WebComponents (Trabajo compartido con la materia Seminario de Actualización)______________________________________________________
Analice el código HTML/CSS/JS proporcionado a través del repositorio GitHub. 
Se trata de una plantilla que representa un prototipo de panel de interfaz gráfica basada en la librería CSS
(W3Schools) para una aplicación genérica. Del repositorio adjuntado, deberá:

Construir un WebComponent con nombre WCLoginFormView que encapsule el formulario LOGIN de la plantilla proporcionada. 
Construir un WebComponent con nombre WCRegisterFormView que encapsule el formulario HORIZONTAL FORM de la plantilla.
En este punto, se solicitará la resolución de la actividad (Unidad 2 - Interfaces gráficas de aplicación (Parte I)) para quienes cursen Seminario de Actualización. Por lo tanto satisface ambas materias.

3. Refactorización final de arquitectura_______________________________

Pendiente. Se definirá con el docente. 

4. Integración final___________________________________________________

Una vez que el frontend basado en WebComponents del punto 2 esté completamente desarrollado y se haya finalizado con la refactorización final de arquitectura. Se efectuará la integración de las funcionalidades desarrolladas en sdk/v2 con respecto a la "Gestión de Usuarios, Grupos, Permisos" y "Login/Registro" de usuarios. 
Siempre que una petición mediante RPCWebAPIFetch arroje una excepción de tipo NotAuthorized/Unauthorized, el frontend deberá siempre vaciar las credenciales guardadas en la aplicación cliente y mostrar la pantalla de login. De igual manera cuando el usuario solicite un logout.
En la barra lateral izquierda, deberán colocarse los accesos a: 
-Gestión de usuarios y grupos   
-Control de accesos
En la barra superior se deberá inyectar en la sección superior derecha el acceso al cierre de sesión correspondiente.
Se deberá utilizar un logo institucional del ISFT 151 para la plantilla base terminada.
La plantilla deberá ser completamente funcional de los casos de uso presentados.

_____________________________________________________________IMPORTANTE______________________________________________________________
POST   --> En la ruta /login autentica e inicia sesión
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
-----Lo que hace cada parte-----
backend/
    main.mjs     : igual que sdk/v4
    config.json  : igual que sdk/v4
    package.json
    .gitignore   : excluye node_modules y db.sqlite3
frontend/
    index.html            : punto de entrada, importa los WebComponents y contiene RPCWebAPIFetch
    WCLoginFormView.js    : WebComponent del formulario de inicio de sesión
    WCRegisterFormView.js : WebComponent del formulario de registro
_______________________________________________________________AJUSTES________________________________________________________________
--- Se renombró RPCApiFetch a RPCWebAPIFetch(name, content) según consigna.
    El resto del comportamiento se mantuvo igual a sdk/v4.

--- Se construyó WCLoginFormView siguiendo lo visto en seminario:
    Todos los elementos se crean con document.createElement() sin excepción.

    Las clases CSS se asignan con classList.add() y los estilos con element.style.propiedad.

    Los elementos del formulario se encapsulan en la función de creación createLoginContainer()
    por fuera de la clase, siguiendo la estructura de tres bloques: construir / asignar / ensamblar.

    En connectedCallback se vincula el evento con addEventListener y .bind(this).

    En disconnectedCallback se desvincula el evento con removeEventListener.

    Al confirmar despacha CustomEvent('request', { bubbles: true, detail: { action: 'login', username, password } }).

--- Se construye WCRegisterFormView con la misma metodología.
    La función createFormRow(labelText, inputId, inputType, placeholderText) encapsula cada fila del formulario horizontal para evitar repetición de código.
    Al confirmar despacha CustomEvent('request', { bubbles: true, detail: { action: 'register', username, password } }).
    Valida que las contraseñas coincidan antes de despachar.

--- El index.html escucha el evento 'request' en document con bubbles: true.
    Discrimina la acción con e.detail.action igual al patrón del controlador MVC.
    Los WebComponents no conocen la lógica de red ni la función RPCWebAPIFetch.
_______________________________________________________________CORRECCIÓN ________________________________
--- Los WebComponents tenían HTML/CSS incrustado mediante innerHTML.
    Se reemplazó con document.createElement()
   Se respeto que:
No se puede incrustar código HTML con innerHTML.
Las clases CSS siempre con classList.add(), nunca className directamente.
Los estilos inline con element.style.propiedad, nunca innerHTML.

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

