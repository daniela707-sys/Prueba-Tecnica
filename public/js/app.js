document.addEventListener('DOMContentLoaded', function() {
    // 1. OBTENER ELEMENTOS DEL DOM
    const form = document.getElementById('producto-form');
    const idInput = document.getElementById('producto-id');
    const nombreInput = document.getElementById('nombre');
    const descripcionInput = document.getElementById('descripcion');
    const precioInput = document.getElementById('precio');
    const stockInput = document.getElementById('stock');
    const imagenInput = document.getElementById('imagen');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const productosBody = document.getElementById('productos-body');
    const carouselInner = document.getElementById('carousel-inner');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Verificar que todos los elementos existen
    if (!form || !idInput || !nombreInput || !descripcionInput || !precioInput || 
        !stockInput || !imagenInput || !submitBtn || !cancelBtn || 
        !productosBody || !carouselInner || !prevBtn || !nextBtn) {
        console.error('Error: No se encontraron todos los elementos necesarios en el DOM');
        return;
    }

    // 2. CONFIGURACIÓN INICIAL
    const API_URL = window.location.origin + '/PruebaTecnica/app/controllers/ProductsController.php';
    let productos = [];
    let currentIndex = 0;
    let editingId = null;
    let carruselInterval;

    // 3. FUNCIONES PRINCIPALES

    // Cargar productos desde la API
    async function cargarProductos() {
        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`La respuesta no es JSON: ${text.substring(0, 100)}...`);
            }
            
            productos = await response.json();
            renderTabla();
            renderCarrusel();
        } catch (error) {
            console.error('Error al cargar productos:', error);
            alert('No se pudieron cargar los productos. Verifica la consola para más detalles.');
        }
    }

    // Renderizar tabla de productos
    function renderTabla() {
        productosBody.innerHTML = '';
        
        if (productos.length === 0) {
            productosBody.innerHTML = '<tr><td colspan="6">No hay productos registrados</td></tr>';
            return;
        }

        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>${producto.descripcion}</td>
                <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                <td>${producto.stock}</td>
                <td>
                    <button class="btn-editar" data-id="${producto.id}">Editar</button>
                    <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
                </td>
            `;
            productosBody.appendChild(row);
        });

        // Agregar eventos a los botones
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => editarProducto(btn.dataset.id));
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => eliminarProducto(btn.dataset.id));
        });
    }

        

        // Función para renderizar el carrusel
        function renderCarrusel() {
            const carruselInner = document.getElementById('carousel-inner');
            carruselInner.innerHTML = '';

            if (productos.length === 0) {
                carruselInner.innerHTML = `
                    <div class="carousel-item active">
                        <img src="https://via.placeholder.com/1200x450?text=No+hay+productos" 
                            alt="No hay productos disponibles">
                    </div>
                `;
                return;
            }

            productos.forEach((producto, index) => {
                const item = document.createElement('div');
                item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
                
                // Ruta de la imagen
                const imagenUrl = producto.imagen 
                    ? `/PruebaTecnica/public/uploads/${producto.imagen}`
                    : 'https://via.placeholder.com/1200x450?text=Sin+imagen';

                item.innerHTML = `
                    <img src="${imagenUrl}" 
                        alt="${producto.nombre}"
                        onerror="this.src='https://via.placeholder.com/1200x450?text=Error+al+cargar+imagen'"
                        class="carousel-img">
                    <div class="product-info">
                        <h3>${producto.nombre}</h3>
                        <p>${producto.descripcion}</p>
                        <span class="price">$${parseFloat(producto.precio).toFixed(2)}</span>
                    </div>
                `;
                
                carruselInner.appendChild(item);
            });

            // Iniciar autoplay
            startCarouselAutoPlay();
        }

        // Función para mostrar un slide específico
        function showSlide(index) {
            const items = document.querySelectorAll('.carousel-item');
            items.forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });
            currentIndex = index;
        }

        // Navegación del carrusel
        function nextSlide() {
            currentIndex = (currentIndex + 1) % productos.length;
            showSlide(currentIndex);
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + productos.length) % productos.length;
            showSlide(currentIndex);
        }

        // Autoplay del carrusel
        function startCarouselAutoPlay() {
            stopCarouselAutoPlay();
            carruselInterval = setInterval(nextSlide, 5000); // Cambia cada 5 segundos
        }

        function stopCarouselAutoPlay() {
            if (carruselInterval) {
                clearInterval(carruselInterval);
            }
        }

        // Eventos para los botones
        document.getElementById('prevBtn')?.addEventListener('click', () => {
            stopCarouselAutoPlay();
            prevSlide();
            startCarouselAutoPlay();
        });

        document.getElementById('nextBtn')?.addEventListener('click', () => {
            stopCarouselAutoPlay();
            nextSlide();
            startCarouselAutoPlay();
        });

        // Pausar autoplay al hacer hover
        document.querySelector('.carousel')?.addEventListener('mouseenter', stopCarouselAutoPlay);
        document.querySelector('.carousel')?.addEventListener('mouseleave', startCarouselAutoPlay);

        // Cargar productos al iniciar
        document.addEventListener('DOMContentLoaded', () => {
            cargarProductos().then(renderCarrusel);
        });

    // 4. MANEJADORES DE EVENTOS

    // Manejador del formulario
async function handleSubmit(e) {
    e.preventDefault();
    
    try {
        // Validar campos requeridos
        if (!nombreInput.value || !descripcionInput.value || !precioInput.value || !stockInput.value) {
            throw new Error('Todos los campos son requeridos');
        }

        const formData = new FormData();
        formData.append('nombre', nombreInput.value);
        formData.append('descripcion', descripcionInput.value);
        formData.append('precio', precioInput.value);
        formData.append('stock', stockInput.value);
        
        // Agregar imagen si existe
        if (imagenInput.files[0]) {
            formData.append('imagen', imagenInput.files[0]);
        }

        // Agregar ID si estamos editando
        if (editingId) {
            formData.append('id', editingId);
        }

        const response = await fetch(API_URL, {
            method: editingId ? 'PUT' : 'POST',
            body: editingId ? JSON.stringify(Object.fromEntries(formData)) : formData,
            headers: editingId ? { 'Content-Type': 'application/json' } : {}
        });

        // Verificar respuesta
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error en la respuesta del servidor');
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'La operación no fue exitosa');
        }

        alert(`Producto ${editingId ? 'actualizado' : 'creado'} correctamente!`);
        resetForm();
        cargarProductos();
    } catch (error) {
        console.error('Error al guardar producto:', error);
        alert(`Error: ${error.message}`);
    }
}

    // Editar producto
    function editarProducto(id) {
        const producto = productos.find(p => p.id == id);
        if (producto) {
            editingId = producto.id;
            idInput.value = producto.id;
            nombreInput.value = producto.nombre;
            descripcionInput.value = producto.descripcion;
            precioInput.value = producto.precio;
            stockInput.value = producto.stock;
            
            submitBtn.textContent = 'Actualizar';
            cancelBtn.style.display = 'inline-block';
            form.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Eliminar producto
    async function eliminarProducto(id) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        
        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });

            if (!response.ok) throw new Error('Error al eliminar');

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'No se pudo eliminar el producto');
            }

            alert('Producto eliminado correctamente');
            cargarProductos();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert(`Error: ${error.message}`);
        }
    }

    // Resetear formulario
    function resetForm() {
        form.reset();
        editingId = null;
        idInput.value = '';
        submitBtn.textContent = 'Guardar';
        cancelBtn.style.display = 'none';
    }

    // 5. ASIGNAR EVENTOS

    // Evento del formulario
    form.addEventListener('submit', handleSubmit);

    // Evento del botón cancelar
    cancelBtn.addEventListener('click', resetForm);

    // Eventos del carrusel
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + productos.length) % productos.length;
        showSlide(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % productos.length;
        showSlide(currentIndex);
    });

    // 6. INICIAR APLICACIÓN
    cargarProductos();
});

/*
// Función mejorada para manejar el formulario
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const isEditing = idInput.value !== '';

    try {
        let response;
        
        if (isEditing) {
            // Para edición (PUT)
            const jsonData = {
                id: idInput.value,
                nombre: nombreInput.value,
                descripcion: descripcionInput.value,
                precio: precioInput.value,
                stock: stockInput.value
            };
            
            if (imagenInput.files[0]) {
                jsonData.imagen = await processImage(imagenInput.files[0]);
            }
            
            response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsonData)
            });
        } else {
            // Para creación (POST)
            response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });
        }

        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const errorText = await response.text();
            throw new Error(`El servidor respondió con: ${errorText.substring(0, 100)}...`);
        }

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Error en la operación');
        }
        
        alert(`Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`);
        resetForm();
        cargarProductos();
    } catch (error) {
        console.error('Error en el formulario:', error);
        alert(`Error: ${error.message}`);
    }
}

// Función para procesar imágenes
async function processImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Aquí podrías comprimir o redimensionar la imagen si es necesario
            resolve(e.target.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Asignar el evento corregido
form.removeEventListener('submit', handleSubmit); // Elimina el anterior si existe
form.addEventListener('submit', handleFormSubmit);*/
