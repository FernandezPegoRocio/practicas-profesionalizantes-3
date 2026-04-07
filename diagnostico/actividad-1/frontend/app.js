window.onload = mostrarStock;

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

function main() {

    function mostrarFormularioAgregar() { console.log("Mostrar Agregar"); }
    function mostrarFormularioCompra() { console.log("Mostrar Compra"); }
    function mostrarFormularioVenta() { console.log("Mostrar Venta"); }

   document.getElementById('btnMostrarStock').onclick = mostrarStock;
    document.getElementById('btnAgregarMaterial').onclick = mostrarFormularioAgregar;
    document.getElementById('btnRegistrarCompra').onclick = mostrarFormularioCompra;
    document.getElementById('btnRegistrarVenta').onclick = mostrarFormularioVenta;

  
    if (btnMostrarStock) btnMostrarStock.onclick = mostrarStock;
    if (btnAgregarMaterial) btnAgregarMaterial.onclick = mostrarFormularioAgregar;
    if (btnRegistrarCompra) btnRegistrarCompra.onclick = mostrarFormularioCompra;
    if (btnRegistrarVenta) btnRegistrarVenta.onclick = mostrarFormularioVenta;
  mostrarStock();
}
window.onload = main;
