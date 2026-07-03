// ==========================================================================
// 1. REFERENCIAS A LOS ELEMENTOS DEL HTML
// ==========================================================================
const contenedorProductos = document.getElementById('contenedor-productos');
const buscadorTexto = document.getElementById('buscador-texto');
const filtroMarca = document.getElementById('filtro-marca');

// Variable global para almacenar los productos que traemos del JSON
let todosLosProductos = [];

// ==========================================================================
// 2. FUNCIÓN PARA CARGAR LOS DATOS DESDE EL ARCHIVO JSON
// ==========================================================================
async function cargarProductos() {
    try {
        const respuesta = await fetch('./productos.json');
        todosLosProductos = await respuesta.json(); // Guardamos los datos en la variable global
        
        // Mostramos todos los productos al cargar la página por primera vez
        mostrarProductos(todosLosProductos);
        
    } catch (error) {
        console.error('Error al cargar el archivo JSON:', error);
        contenedorProductos.innerHTML = `<p>Hubo un error al cargar los productos.</p>`;
    }
}

// ==========================================================================
// 3. FUNCIÓN PARA "PINTAR" LOS PRODUCTOS EN EL HTML (CON IMAGEN DOBLE)
// ==========================================================================
function mostrarProductos(listaProductos) {
    contenedorProductos.innerHTML = '';

    // Si el usuario buscó algo y no hay coincidencias en el JSON
    if (listaProductos.length === 0) {
        contenedorProductos.innerHTML = `
            <div class="sin-resultados">
                <p>No se encontraron embragues que coincidan con tu búsqueda.</p>
                <br>
                <h3>¿No encuentras el embrague para tu vehículo?</h3>
                <p>Disponemos de un amplio stock físico en nuestro taller en Quito que tal vez aún no esté en la página web.</p>
                <button class="btn-cotizar-general" id="btn-consulta-vacia">Consultar por WhatsApp</button>
            </div>
        `;
        
        // Asignamos el evento al botón de la caja vacía
        document.getElementById('btn-consulta-vacia').addEventListener('click', enviarConsultaGeneral);
        return;
    }

    // Si hay productos, los recorremos uno a uno
    listaProductos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';

        const primerAnio = producto.anios_compatibles[0];
        const ultimoAnio = producto.anios_compatibles[producto.anios_compatibles.length - 1];

        // Cambiamos la etiqueta img simple por el nuevo contenedor con efecto hover dinámico
        card.innerHTML = `
            <div class="producto-imagen-contenedor">
                <img src="${producto.imagen_vehiculo || 'https://via.placeholder.com/300x200?text=Auto'}" class="img-vehiculo" alt="${producto.modelo_vehiculo}">
                <img src="${producto.imagen_embrague || 'https://via.placeholder.com/300x200?text=Embrague'}" class="img-embrague" alt="Kit de embrague">
            </div>

            <h3>${producto.marca_vehiculo} ${producto.modelo_vehiculo}</h3>
            <p class="componente"><strong>${producto.componente}</strong></p>
            <p><strong>Marca repuesto:</strong> ${producto.marca_repuesto}</p>
            <p class="specs"><strong>Especificaciones:</strong> ${producto.especificaciones || 'No especificadas'}</p>
            <p><strong>Años:</strong> ${primerAnio} - ${ultimoAnio}</p>
            <p class="precio">Precio: $${producto.precio_nuevo.toFixed(2)}</p>
            
            ${producto.servicio_asociado.ofrece_rectificacion_volante ? 
                `<p class="combo">+ Combo Rectificación Volante por: <strong>$${producto.servicio_asociado.precio_combo_rectificacion.toFixed(2)}</strong></p>` : ''
            }
            
            <p class="stock">Estado: <span>${producto.estado_stock}</span></p>
            <button class="btn-cotizar" data-id="${producto.id}">Cotizar / Comprar</button>
        `;

        contenedorProductos.appendChild(card);
    });

    // TARJETA COMODÍN AL FINAL DEL CATÁLOGO
    const tarjetaComodin = document.createElement('div');
    tarjetaComodin.className = 'producto-card tarjeta-ayuda';
    tarjetaComodin.innerHTML = `
        <div class="contenido-ayuda">
            <h3>¿Buscas otro modelo?</h3>
            <p class="componente">Consulta de Stock Especializado</p>
            <p>Si tienes dudas adicionales sobre compatibilidades, marcas alternativas o necesitas un embrague para un vehículo pesado o descontinuado, consúltanos directamente.</p>
            <p class="precio">¡Atención Inmediata!</p>
            <button class="btn-cotizar-general" id="btn-ayuda-final">Preguntar a un Técnico</button>
        </div>
    `;
    contenedorProductos.appendChild(tarjetaComodin);
    
    // Asignamos el evento al botón de la tarjeta comodín
    document.getElementById('btn-ayuda-final').addEventListener('click', enviarConsultaGeneral);
}

// Función auxiliar para enviar un mensaje abierto a WhatsApp
function enviarConsultaGeneral() {
    const miTelefono = "593983306051"; 
    const mensaje = `Hola, estuve revisando su catálogo web de embragues pero no encontré el repuesto exacto para mi vehículo (o tengo dudas extras). \n\n¿Me podrían ayudar confirmando disponibilidad o asesorándome con una cotización personalizada?`;
    
    const mensajeCodificado = encodeURIComponent(mensaje);
    const enlaceWhatsApp = `https://wa.me/${miTelefono}?text=${mensajeCodificado}`;
    window.open(enlaceWhatsApp, '_blank');
}

// ==========================================================================
// 4. FUNCIÓN PARA FILTRAR
// ==========================================================================
function filtrarProductos() {
    const textoBusqueda = buscadorTexto.value.toLowerCase();
    const marcaSeleccionada = filtroMarca.value;

    const productosFiltrados = todosLosProductos.filter(producto => {
        // Aseguramos compatibilidad con las llaves correctas de tu JSON
        const coincideTexto = producto.marca_vehiculo.toLowerCase().includes(textoBusqueda) || 
                              producto.modelo_vehiculo.toLowerCase().includes(textoBusqueda) || 
                              (producto.especificaciones && producto.especificaciones.toLowerCase().includes(textoBusqueda));
        
        const coincideMarca = marcaSeleccionada === 'todos' || producto.marca_vehiculo === marcaSeleccionada;

        return coincideTexto && coincideMarca;
    });

    mostrarProductos(productosFiltrados);
}

// ==========================================================================
// 5. ESCUCHADORES DE EVENTOS
// ==========================================================================
if (buscadorTexto && filtroMarca) {
    buscadorTexto.addEventListener('input', filtrarProductos);
    filtroMarca.addEventListener('change', filtrarProductos);
}

// ==========================================================================
// 6. LÓGICA DE COTIZACIÓN POR WHATSAPP
// ==========================================================================
contenedorProductos.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-cotizar')) {
        const idProducto = e.target.getAttribute('data-id');
        const productoSeleccionado = todosLosProductos.find(p => p.id === idProducto);
        
        if (productoSeleccionado) {
            enviarWhatsApp(productoSeleccionado);
        }
    }
});

function enviarWhatsApp(producto) {
    const miTelefono = "593983306051"; 

    const mensaje = `Hola, estoy interesado en cotizar el siguiente repuesto:\n\n- *Componente:* ${producto.componente}\n- *Vehículo:* ${producto.marca_vehiculo} ${producto.modelo_vehiculo}\n- *Marca Repuesto:* ${producto.marca_repuesto}\n- *Especificaciones:* ${producto.especificaciones || 'No especificadas'}\n- *Precio de lista:* $${producto.precio_nuevo.toFixed(2)}\n${producto.servicio_asociado.ofrece_rectificacion_volante ? `- *¿Desea combo rectificación?:* Sí (+$${producto.servicio_asociado.precio_combo_rectificacion.toFixed(2)})` : ''}\n\n¿Tienen disponibilidad inmediata para retirar o realizar envio?`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const enlaceWhatsApp = `https://wa.me/${miTelefono}?text=${mensajeCodificado}`;
    window.open(enlaceWhatsApp, '_blank');
}

// ==========================================================================
// 7. CONTROL DEL DESLIZADOR ANTES/DESPUÉS (PÁGINA SERVICIOS) Y INICIALIZADOR
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar el slider si existe en la página actual
    const barra = document.getElementById('control-deslizador');
    const imagenAntes = document.querySelector('.imagen-box.antes');

    if (barra && imagenAntes) {
        barra.addEventListener('input', (e) => {
            const valor = e.target.value;
            imagenAntes.style.width = `${valor}%`;
        });
    }

    // Ejecutamos la carga de productos solo si estamos en el catálogo
    if (contenedorProductos) {
        cargarProductos();
    }
});