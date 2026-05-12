<<<<<<< HEAD
const mysql2 = require('mysql2');
const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'pplll-actividad-1'
});

pool.query(`
       CREATE TABLE IF NOT EXISTS stock (
       id INT AUTO_INCREMENT PRIMARY KEY,
       material VARCHAR(100) UNIQUE NOT NULL,
       medida VARCHAR(20) NOT NULL,
       cantidad DECIMAL(10,2) NOT NULL CHECK (cantidad >= 0),
       precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario > 0),
       precio_total DECIMAL(10,2) NOT NULL
    )
`, (err) => {
    if (err) console.error('Error al crear la tabla:', err);
    else console.log('Tabla stock lista');
});

module.exports = pool;
=======
const mysql2 = require('mysql2');
const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'pplll-actividad-1'
});

pool.query(`
       CREATE TABLE IF NOT EXISTS stock (
       id INT AUTO_INCREMENT PRIMARY KEY,
       material VARCHAR(100) UNIQUE NOT NULL,
       medida VARCHAR(20) NOT NULL,
       cantidad DECIMAL(10,2) NOT NULL CHECK (cantidad >= 0),
       precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario > 0),
       precio_total DECIMAL(10,2) NOT NULL
    )
`, (err) => {
    if (err) console.error('Error al crear la tabla:', err);
    else console.log('Tabla stock lista');
});

module.exports = pool;
>>>>>>> b1e00c617c256edfd825435ebf503bd19504561c
