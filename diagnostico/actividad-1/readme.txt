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
const mysql2 = require('mysql2');

//Importamos el paquete mysql2, estructura base:

const pool = ___.___ ({
    host: '___',
    user: '___',
    password: '___',
    database: '___'
});

//Creamos un pool de conexiones a tu base de datos MySQ
pool.query(CREATE TABLE con toda la informacion)

//Si la tabla ya existe no la vuelve a crear, si no existe la crea. Para ello escribimos:
    if (err) console.error('Error al crear la tabla:', err);
    else console.log('Tabla stock lista');

//Exportás el pool para que server.js lo pueda importar y usarlo en las rutas.
module.exports = pool;

____________________________________________________________________________________________________
_________________________________________server.js__________________________________________________

