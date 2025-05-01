document.addEventListener('DOMContentLoaded', function() {
    const productoForm = document.getElementById('producto-form');
    const productosTable = document.getElementById('productos-body');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    let editingId = null;

    // Cargar productos al iniciar
    cargarProductos();

    // Manejar envío del formulario
    productoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const producto = {
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value,
            precio: parseFloat(document.getElementById('precio').value),
            stock: parseInt(document.getElementById('stock').value)
        };

        if (editingId) {
            producto.id = editingId;
            actualizarProducto(producto);
        } else {
            crearProducto(producto);
        }
    });

    // Manejar cancelar edición
    cancelBtn.addEventListener('click', function() {
        resetForm();
    });

    // Función para cargar productos
    function cargarProductos() {
        fetch('../../app/controllers/ProductosController.php')
            .then(response => response.json())
            .then(data => {
                productosTable.innerHTML = '';
                if (data.data && data.data.length > 0) {
                    data.data.forEach(producto => {
                        productosTable.appendChild(crearFilaProducto(producto));
                    });
                } else {
                    productosTable.innerHTML = '<tr><td colspan="6">No hay productos registrados</td></tr>';
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Función para crear un producto
    function crearProducto(producto) {
        fetch('../../app/controllers/ProductosController.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.mensaje);
            resetForm();
            cargarProductos();
        })
        .catch(error => console.error('Error:', error));
    }

    // Función para actualizar un producto
    function actualizarProducto(producto) {
        fetch('../../app/controllers/ProductosController.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(producto)
        })
        .then(response => response.json())
        .then(data => {
            alert(data.mensaje);
            resetForm();
            cargarProductos();
        })
        .catch(error => console.error('Error:', error));
    }

    // Función para eliminar un producto
    function eliminarProducto(id) {
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            fetch('../../app/controllers/ProductosController.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.mensaje);
                cargarProductos();
            })
            .catch(error => console.error('Error:', error));
        }
    }

    // Función para editar un producto
    function editarProducto(id) {
        fetch(`../../app/controllers/ProductosController.php?id=${id}`)
            .then(response => response.json())
            .then(producto => {
                editingId = producto.id;
                document.getElementById('producto-id').value = producto.id;
                document.getElementById('nombre').value = producto.nombre;
                document.getElementById('descripcion').value = producto.descripcion;
                document.getElementById('precio').value = producto.precio;
                document.getElementById('stock').value = producto.stock;
                
                formTitle.textContent = 'Editar Producto';
                submitBtn.textContent = 'Actualizar';
                cancelBtn.style.display = 'inline-block';
            })
            .catch(error => console.error('Error:', error));
    }

    // Función para crear una fila de producto en la tabla
    function crearFilaProducto(producto) {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${producto.descripcion}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>${producto.stock}</td>
            <td>
                <button class="btn-editar" data-id="${producto.id}">Editar</button>
                <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
            </td>
        `;
        
        // Agregar eventos a los botones
        tr.querySelector('.btn-editar').addEventListener('click', function() {
            editarProducto(this.getAttribute('data-id'));
        });
        
        tr.querySelector('.btn-eliminar').addEventListener('click', function() {
            eliminarProducto(this.getAttribute('data-id'));
        });
        
        return tr;
    }

    // Función para resetear el formulario
    function resetForm() {
        productoForm.reset();
        editingId = null;
        document.getElementById('producto-id').value = '';
        formTitle.textContent = 'Agregar Producto';
        submitBtn.textContent = 'Guardar';
        cancelBtn.style.display = 'none';
    }
});