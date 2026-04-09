CONSIGNA:
Contenidos a trabajar: Frontend/Backend
Modalidad: Individual
Formato de entrega: Repositorios GitHub carpeta "diagnostico/actividad-1"

Descripción del problema

Para este primer trabajo práctico introductorio al desarrollo de sistemas de información, se le solicitará bajo sus conocimientos
previos complementando con investigación personal, intentar desarrollar un sistema mínimo de gestión de información para la administración de un stock de materiales/objetos correspondiente a una planta de reciclaje.

La planta recicla: Vidrio, Hierro, Aluminio, Cobre, Bronce, Cartón, Papel Blanco, Tapas de plástico, Aceite de girasol, Baterías de vehículos y está considerando en algún momento incorporar algún nuevo material.

La dinámica de la planta consiste en adquirir materiales y revenderlos a las fábricas procesadoras. Por lo tanto, el stock de los materiales va incrementándose/decrementándose según las compras/ventas.

No todos los materiales/objetos se cuantifican y gestionan por igual, por ejemplo: Las baterías de vehículos se gestionan por unidades, otros materiales sólidos se gestionan por kg (kilos), mientras que los fluídos se gestionan por metros cúbicos (m^3).

La gestión del stock debe ser consistente y debe trabajar con cantidades positivas (nunca stocks negativos), como así también validar los montos en las operaciones sobre el mismo y no permitir la duplicación de materiales/objetos.


Resolución


1. En primer lugar, lea bien la consigna y trate de identificar los casos de uso/requerimientos funcionales para saber qué debe desarrollar y que no debe desarrollar.

2. Para la interfaz gráfica (aplicación cliente) podrá utilizar cualquier tecnología que conozca y/o le permita plantear el caso de uso pedido. En caso de que no conozca ninguna, deberá emplear HTML/CSS/JS.

3. Todos los datos vinculados al stock deberán gestionarse en una única tabla en una base de datos relacional. No amplíe ni sobredesarrolle el modelo de datos.

4. El backend (aplicación servidor) podrá desarrollarse en cualquier lenguaje de programación a elección, siempre y cuando le permita conectar con la interfaz gráfica que utilice.

5. Cuando se abre la aplicación cliente, la interfaz gráfica deberá mostrar una tabla o listado de los materiales/objetos en el stock con su nombre y cantidad correspondiente. Como así también las operaciones mínimas que usted encuentre en la consigna.

node.js - express - MYSQL - httml/css/js
    __________________________________________________________________
                           PLANTA DE RECICLAJE
    __________________________________________________________________
                                    |
                            Se encarga de
                                    |
               ____________                     ____________
                  VENDER                           COMPRAR
               ____________                     ____________
                    |                                 | 
    //accion al vender baja el stock      //accion al comprar el stock sube
                    |_________________________________|
                                     |
                                MATERIAL/ES (// Pueder ser por herencia)
                                     |
                           Se puede adquirir por
  ___________________________________|__________________________________
  |                                  |                                  |
X UNIDAD                          X KILO                              X m3
  |                                  |                                  |
Nro entero             VIDRIO, HIERRO, ALUMINIO, COBRE,              ACEITE DE 
BATERIA DE              BRONCE, CARTON, PAPEL BLANCO,                 GIRASOL
VEHICULOS                    TAPAS DE PLASTICO
    ---------------------------------------------------------------------
                             TENER CUIDADO!!!!!
   ------------------------------------------------------------------------
      1)   EL STOCK NO DEBE ESTAR EN NEGATIVO
      2)   NO DUPLICAR MATERIALES
      3)   PONER MONTOS EN COMPRAR/VENTAS
      2)   CADA MATERIAL CON SU MEDIDA

          /////////////////// BOCETO DE TABLA //////////////////////
          
            PLANTA DE RECICLAJE. SRL
____________________________________________________
| id | MATERIAL | MEDIDA | CANTIDAD | preciUnitario|
____________________________________________________
|  1 |  vidrio  |   Kl   |     4    |  $1.0000     |
____________________________________________________
                     | TOTAL:  $ 4.000             |
                      ______________________________
 extra: no hace falta hacerlo no lo pide la consigna
 _
|_| retira: _ _ / _ _ / _ _
 _
|_| envio: _ _ / _ _ / _ _

------ NECESITAMOS TABLA CON:
 ID -> PRIMARY KEY AUTOINCREMENT
MATERIAL -> UNIQUE NOT NULL
MEDIDA -> NOT NULL
CANTIDAD -> NOT NULL MAYOR A 0
precioUnitario -> NOT NULL MAYOR A CERO


-------- LA APP VA A PODER REALIZAR
* VER STOCK DE LOS MATERIALES
* REGISTRAR COMPRA DE MATERIALES
* REGISTRAR VENTA DE MATERIALE
* AGREGAR MATERIAL
____________________________________________________________________________________________________
_______________________________________database.js__________________________________________________
//Necesitamos importar el idioma: 
//Importamos el paquete mysql2, estructura base:

const mysql2 = require('mysql2');

const pool = mysql2.createPool({
    host:     '___',
    user:     '___',
    password: '___',
    database: '___'
});

pool.query(`CREATE TABLE IF NOT EXISTS ___ (...)`,
    (err) => {
        if (err) console.error('Error al crear la tabla:', err);
        else     console.log('Tabla ___ lista');
    }
);

module.exports = pool;


//Creamos un pool de conexiones a tu base de datos MySQ
pool.query(CREATE TABLE con toda la informacion)

//Si la tabla ya existe no la vuelve a crear, si no existe la crea. Para ello escribimos:
    if (err) console.error('Error al crear la tabla:', err);
    else console.log('Tabla stock lista');

//Exportás el pool para que server.js lo pueda importar y usarlo en las rutas.
module.exports = pool;

____________________________________________________________________________________________________
_________________________________________server.js__________________________________________________

-----------definiciones importantes:
express -> permite crear el servidor y las rutas
pool -> importa la conexión a la base de datos desde database.js
app.use(express.json()) -> entiende los datos en formato JSON que llegan desde el frontend. 
GET -> recupera info de la base de datos
POST -> envía datos al servidos para insertar y/o modifical
app.listen(3000) → arranca el servidor en el puerto 3000
cors	Permite que el frontend se conecte al backend desde el navegador
? en queries	Placeholder seguro contra SQL Injection — mysql2 sanitiza el valor


-----------estructura base que sirve para proyectos:
const express = require('express');
const cors    = require('cors');
const pool    = require('./___');

const app = express();
app.use(cors());
app.use(express.json());

// GET — obtener datos
app.get('/___', function(req, res) {
    pool.query('SELECT * FROM ___', function(err, resultados) {
        if (err) return res.status(500).json({ error: err.message });
        res.json(resultados);
    });
});

// POST — insertar datos
app.post('/___', function(req, res) {
    const { ___ } = req.body;
    pool.query(
        'INSERT INTO ___ (___) VALUES (?)',
        [___],
        function(err, resultado) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: '___' });
        }
    );
});

// PUT — modificar datos
app.put('/___', function(req, res) { ... });

// DELETE — eliminar datos
app.delete('/___', function(req, res) { ... });

app.listen(___, () => { console.log('___'); });

____________________________________________________________________________________________________
___________________________________________index.html________________________________________________

Es la estructura visual de la aplicación. Define qué elementos aparecen en la pantalla.
Tiene cuatro partes principales:
Head -> configura la página
Botones -> los cuatro botones superiores que el usuario usa para interactuar. Cada uno tiene un id único para que app.js pueda conectarles una acción
Tabla -> muestra el stock. El encabezado está escrito en el HTML
Modal -> la ventana emergente que aparece al hacer clic en agregar, comprar o vender

-----------estructura base que sirve para proyectos:

<!DOCTYPE html>
<html lang='___'>
<head>
    <meta charset='utf-8' />
    <title>___</title>
    <link rel='stylesheet' href='style.css'>
</head>
<body>

    <!-- Botones de operaciones -->
    <button id='___'>___</button>
    <button id='___'>___</button>

    <!-- Tabla de datos -->
    <table>
        <thead>
            <tr><th colspan='___'>___</th></tr>
            <tr>
                <th>___</th>
                <th>___</th>
            </tr>
        </thead>
        <tbody id='___'>
            <!-- filas dinámicas desde app.js -->
        </tbody>
        <tfoot>
            <tr>
                <td colspan='___'>___</td>
                <td id='___'>___</td>
            </tr>
        </tfoot>
    </table>

    <!-- Modal -->
    <div id='modal'>
        <div id='modalContenido'>
            <h2 id='modalTitulo'></h2>
            <div id='modalFormulario'></div>
            <button id='btnConfirmar'>___</button>
            <button id='btnCancelar'>___</button>
        </div>
    </div>

    <script src='app.js'></script>
</body>
</html>

____________________________________________________________________________________________________
____________________________________________app.js__________________________________________________

Se encarga de mostrar los datos, para ello al cargar la pagina, le pide al back la lista y muestra la tabla con la que interactua el usuario. 

-----------estructura base que sirve para proyectos:
window.onload = ___;

function mostrarStock() {
    fetch('http://localhost:___/___')
    .then(function(response) { return response.json(); })
    .then(function(datos) {
        const tabla = document.getElementById('___');
        tabla.innerHTML = '';
        datos.forEach(function(fila) {
            tabla.innerHTML += '<tr>' +
                '<td>' + fila.___ + '</td>' +
                '<td>' + fila.___ + '</td>' +
            '</tr>';
        });
    })
    .catch(function(err) { console.error('___', err); });
}

----Funciones del modal----

Cada botón abre el modal con el formulario correspondiente. El título del modal se usa luego para identificar qué operación confirmar.
-----------estructura base que sirve para proyectos:

function mostrarFormulario___() {
    document.getElementById('modalTitulo').innerHTML = '___';
    document.getElementById('modalFormulario').innerHTML = `
        <input id='input___' type='text'   placeholder='___' /><br>
        <input id='input___' type='number' placeholder='___' /><br>
    `;
    document.getElementById('modal').style.display = 'block';
}

----Funciones del cerrarModal----
function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modalFormulario').innerHTML = '';
}

----Función confirmar — detecta qué formulario está abierto----
function confirmar() {
    const titulo = document.getElementById('modalTitulo').innerHTML;

    if (titulo === '___') {
        const ___ = document.getElementById('input___').value;
        fetch('http://localhost:3000/___', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ___ })
        })
        .then(function(response) { return response.json(); })
        .then(function() { cerrarModal(); mostrarStock(); })
        .catch(function(err) { console.error('Error:', err); });

    } else if (titulo === '___') {
        // segunda operación
    } else if (titulo === '___') {
        // tercera operación
    }
}

----Función main — conecta los botones----
function main() {
    mostrarStock();
    document.getElementById('___').onclick = mostrarStock;
    document.getElementById('___').onclick = mostrarFormulario___;
    document.getElementById('btnConfirmar').onclick = confirmar;
    document.getElementById('btnCancelar').onclick = cerrarModal;
}

window.onload = main;

____________________________________________________________________________________________________
____________________________________________server.js__________________________________________________

Archivo de estilos separado del HTML. 
Paleta usada: blanco, gris, negro y azul (#2A69D5 / #2857A9)

-----------estructura base que sirve para proyectos:
/* Reset básico */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: ___, sans-serif;
    background-color: ___;
    color: ___;
    padding: ___;
}

button { background-color: ___; color: ___; border: none;
         padding: ___ ___; margin: ___ ___;
         border-radius: ___; cursor: pointer; }
button:hover { background-color: ___; }

table  { width: 100%; border-collapse: collapse; margin-top: ___; }

thead tr:first-child th { background-color: ___; color: ___; padding: ___; }
thead tr:last-child  th { background-color: ___; color: ___; padding: ___; }

tbody tr:nth-child(even) { background-color: ___; }
tbody tr:hover           { background-color: ___; }
tbody td { padding: ___; text-align: ___; border-bottom: 1px solid ___; }

tfoot td { padding: ___; font-weight: bold; text-align: right;
           background-color: ___; color: ___; }

/* Modal fondo */
#modal { display: none; position: fixed; top: 0; left: 0;
         width: 100%; height: 100%; background-color: ___; }

/* Modal contenido */
#modalContenido { background-color: ___; margin: ___% auto;
                  padding: ___; width: ___; border-radius: ___; }

#modalContenido h2      { color: ___; margin-bottom: ___; }
#modalContenido input,
#modalContenido select  { width: 100%; padding: ___; margin: ___ 0;
                          border: 1px solid ___; border-radius: ___; }

#btnCancelar       { background-color: ___; }
#btnCancelar:hover { background-color: ___; }

______________________________________________________________________________________________________
____________________________________________Arranque__________________________________________________

Antes de correr el servidor: 
-> MySQL debe estar corriendo (UniServerZ) 
-> la base de datos debe existir

// Crear archivo crear_base.sql con:
CREATE DATABASE IF NOT EXISTS `nombre-base` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

// Ejecutar desde terminal:
"C:\ruta\a\mysql.exe" -u root -p < crear_base.sql

cd backend
npm install        // solo la primera vez
node server.js     // arranca el servidor

// Salida esperada:
// Servidor corriendo en puerto 3000
// Tabla stock lista

abrir pagina index.html


