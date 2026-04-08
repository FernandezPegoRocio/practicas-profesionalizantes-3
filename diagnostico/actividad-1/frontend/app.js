function mostrarStock() {
    fetch('http://localhost:3000/stock')
    .then(function(response) {
        return response.json();
    })
    .then(function(datos) {
        const tabla = document.getElementById('tablaStock');
        tabla.innerHTML = '';
        datos.forEach(function(fila) {
            tabla.innerHTML += '<tr>' +
                '<td>' + fila.id + '</td>' +
                '<td>' + fila.material + '</td>' +
                '<td>' + fila.medida + '</td>' +
                '<td>' + fila.cantidad + '</td>' +
                '<td>' + fila.precio_unitario + '</td>' +
                '<td>' + fila.precio_total + '</td>' +
            '</tr>';
        });
    })
    .catch(function(err) {
        console.error('Error al cargar el stock', err);
    });
}

function mostrarFormularioAgregar() {
    document.getElementById('modalTitulo').innerHTML = 'Agregar Material';
    document.getElementById('modalFormulario').innerHTML = `
        <input id="inputMaterial" type="text" placeholder="Nombre del material" /><br>
        <select id="inputMedida">
            <option value="">Medida</option>
            <option value="kg">Kilogramos</option>
            <option value="unidad">Unidad</option>
            <option value="m3">Metros cúbicos</option>
        </select><br>
        <input id="inputCantidad" type="number" placeholder="Cantidad" /><br>
        <input id="inputPrecioUnitario" type="number" placeholder="Precio unitario" /><br>
    `;
    document.getElementById('modal').style.display = 'block';
}

function mostrarFormularioCompra() {
    document.getElementById('modalTitulo').innerHTML = 'Compra de Material';
    document.getElementById('modalFormulario').innerHTML = `
        <input id="inputMaterial" type="text" placeholder="Nombre del material" /><br>
        <input id="inputCantidad" type="number" placeholder="Cantidad comprada" /><br>
    `;
    document.getElementById('btnConfirmar').textContent = 'Registrar Compra';
    document.getElementById('modal').style.display = 'block';
}

function mostrarFormularioVenta() {
    document.getElementById('modalTitulo').innerHTML = 'Venta de Material';
    document.getElementById('modalFormulario').innerHTML = `
        <input id="inputMaterial" type="text" placeholder="Nombre del material" /><br>
        <input id="inputCantidad" type="number" placeholder="Cantidad vendida" /><br>
    `;
    document.getElementById('btnConfirmar').textContent = 'Registrar Venta';
    document.getElementById('modal').style.display = 'block';
}

function confirmar() {
    const titulo = document.getElementById('modalTitulo').innerHTML;
    if (titulo === 'Agregar Material') {
        
    } else if (titulo === 'Compra de Material') {
       
    } else if (titulo === 'Venta de Material') {
       
    }
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modalFormulario').innerHTML = '';
}

if (titulo === 'Agregar Material') {
    const material = document.getElementById('material').value;
    const medida = document.getElementById('medida').value;
    const cantidad = document.getElementById('cantidad').value;
    const precio_unitario = document.getElementById('precio_unitario').value;
    const precio_total = cantidad * precio_unitario;

    fetch('http://localhost:3000/materiales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ material, medida, cantidad, precio_unitario, precio_total })
    })
    .then(function(response) { return response.json(); })
    .then(function(datos) {
        cerrarModal();
        mostrarStock();
    })
    .catch(function(err) { console.error('Error:', err); });
}

function main() {
    mostrarStock();
    document.getElementById('btnVerStock').onclick = mostrarStock;
    document.getElementById('btnAgregarMaterial').onclick = mostrarFormularioAgregar;
    document.getElementById('btnCompra').onclick = mostrarFormularioCompra;
    document.getElementById('btnVenta').onclick = mostrarFormularioVenta;
    document.getElementById('btnConfirmar').onclick = confirmar;
    document.getElementById('btnCancelar').onclick = cerrarModal;
}


window.onload = main;
