const express = require('express');
const pool = require('./database');

const app = express();
app.use(express.json());


app.get('/stock', function(req, res) {
    pool.query('SELECT * FROM stock', function(err, resultados) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(resultados);
    });
});


app.post('/material', function(req, res) {
    const { material, medida, cantidad, precio_unitario, precio_total } = req.body;
    pool.query(
        'INSERT INTO stock (material, medida, cantidad, precio_unitario, precio_total) VALUES (?, ?, ?, ?, ?)',
        [material, medida, cantidad, precio_unitario, precio_total],
        function(err, resultado) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ mensaje: 'Material agregado correctamente' });
        }
    );
});


app.post('/compra', function(req, res) {
    const { material, cantidad } = req.body;
    pool.query(
        'UPDATE stock SET cantidad = cantidad + ? WHERE material = ?',
        [cantidad, material],
        function(err, resultado) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ mensaje: 'Se registro la compra' });
        }
    );
});


app.post('/venta', function(req, res) {
    const { material, cantidad } = req.body;
    pool.query('SELECT cantidad FROM stock WHERE material = ?', [material], function(err, resultados) {
        if (err) return res.status(500).json({ error: err.message });

        if (resultados[0].cantidad < cantidad) {
            return res.status(400).json({ error: 'No hay stock de este material' });
        }

        pool.query(
            'UPDATE stock SET cantidad = cantidad - ? WHERE material = ?',
            [cantidad, material],
            function(err, resultado) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ mensaje: 'La venta procedio sin problemas' });
            }
        );
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});
