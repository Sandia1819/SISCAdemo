// Variables globales
const pdfList = document.getElementById('pdf-list');
const pdfViewer = document.getElementById('pdf-viewer');
const pdfPreview = document.getElementById('pdf-preview');
const closeBtn = document.getElementById('button-container');
const periodoSelect = document.getElementById('periodo');

// Buscar en la lista de PDFs
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');

// Función para filtrar los PDFs por nombre
function filterPDFs(query) {
    const pdfItems = pdfList.getElementsByTagName('li');
    for (let i = 0; i < pdfItems.length; i++) {
        const pdfItem = pdfItems[i];
        const link = pdfItem.querySelector('a');
        if (link && link.textContent.toLowerCase().includes(query.toLowerCase())) {
            pdfItem.style.display = 'block'; // Mostrar el PDF si coincide
        } else {
            pdfItem.style.display = 'none'; // Ocultar el PDF si no coincide
        }
    }
}

// Evento de búsqueda (cuando el usuario escribe algo)
searchInput.addEventListener('input', function() {
    const query = searchInput.value.trim();
    filterPDFs(query);
});

// Evento para limpiar la búsqueda
clearSearchBtn.addEventListener('click', function() {
    searchInput.value = ''; // Limpiar el input
    filterPDFs(''); // Mostrar todos los PDFs
});

// Evento para seleccionar el periodo
periodoSelect.addEventListener('change', function() {
    const selectedPeriodo = this.value;
    if (selectedPeriodo) {
        loadFilesFromDatabase(selectedPeriodo);
    } else {
        pdfList.innerHTML = ''; // Limpiar la lista si no hay periodo seleccionado
    }
});

// Función para cargar los archivos desde la base de datos
function loadFilesFromDatabase(periodo) {
    const pdfList = document.getElementById('pdf-list'); // Contenedor de la lista de PDFs

    if (!pdfList) {
        console.error('Contenedor no encontrado');
        return;
    }

    // Mostrar mensaje de carga mientras se obtienen los archivos
    pdfList.innerHTML = '<li>Loading...</li>';

    // Realizar la solicitud para obtener los PDFs
    fetch(`../../horarios/obtener_pdfs.php?periodo=${periodo}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json(); // Convertir la respuesta a JSON
        })
        .then(data => {
            if (data.success) {
                const pdfs = data.pdfs;
                pdfList.innerHTML = ''; // Limpiar la lista antes de mostrar los nuevos PDFs

                // Iterar sobre los PDFs y mostrarlos en la lista
                if (pdfs.length > 0) {
                    pdfs.forEach(pdf => {
                        const li = document.createElement('li');
                        li.classList.add('li2');
                    
                        const link = document.createElement('a');
                        link.href = '#';
                        link.textContent = pdf.nombre_archivo;
                        link.style.textDecoration = "none";
                        link.style.color = "blue";
                
                    
                        // Agregar el evento de clic para visualizar el PDF
                        link.onclick = function() {
                            showPDFFromBase64(pdf.nombre_archivo, pdf.pdf_base64, li);
                        };

                        li.appendChild(link);
                        pdfList.appendChild(li); // Agregar el <li> a la lista
                    });
                    
                } else {
                    pdfList.innerHTML = '<li>No se encontraron archivos PDF.</li>';
                }
            } else {
                pdfList.innerHTML = '<li>Error al cargar los archivos PDF.</li>';
            }
        })
        .catch(error => {
            console.error('Error al obtener los PDFs:', error);
            pdfList.innerHTML = '<li>Error al cargar los archivos PDF.</li>';
        });
}

// Función para mostrar un archivo PDF desde Base64
function showPDFFromBase64(nombre, pdfBase64, li) {
    // Crear un contenedor para el visor de PDF
    const pdfViewer = document.createElement('div');
    pdfViewer.classList.add('pdf-viewer'); // Contenedor para el visor de PDF

    // Crear el iframe para mostrar el PDF
    const pdfPreview = document.createElement('iframe');
    pdfPreview.src = `data:application/pdf;base64,${pdfBase64}`;
    pdfPreview.width = "100%";
    pdfPreview.height = "500px"; // Ajusta la altura como prefieras

    // Crear el botón de descarga
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Descargar PDF';
    downloadBtn.classList.add('button-container');
    downloadBtn.onclick = function () {
        downloadPDF(nombre, pdfBase64);
    };

    // Crear el botón de cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cerrar';
    closeBtn.classList.add('button-container');
    closeBtn.onclick = function () {
        pdfViewer.remove();  // Eliminar el visor cuando se cierra
    };

    // Añadir los elementos al contenedor
    pdfViewer.appendChild(pdfPreview);
    pdfViewer.appendChild(downloadBtn);
    pdfViewer.appendChild(closeBtn);

    // Insertar el visor justo debajo del PDF seleccionado (en el li)
    li.parentNode.insertBefore(pdfViewer, li.nextSibling);
}

// Función para descargar el PDF desde Base64
function downloadPDF(nombre, pdfBase64) {
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdfBase64}`;
    link.download = nombre; // Nombre del archivo para la descarga
    link.click();
}

// Función para transformar el nombre del periodo en formato amigable
function formatearNombrePeriodo(nombreBaseDatos) {
    // Eliminar el prefijo 'periodo_' si existe
    let nombreFormateado = nombreBaseDatos.replace('periodo_', '');
    
    // Buscar y extraer el año (4 dígitos)
    const coincidenciaAño = nombreFormateado.match(/\d{4}/);
    let año = '';
    
    if (coincidenciaAño) {
        año = coincidenciaAño[0];
        nombreFormateado = nombreFormateado.replace(año, '');
    }
    
    // Eliminar cualquier guion bajo o espacio
    nombreFormateado = nombreFormateado.replace(/_/g, '');
    
    // Lista de meses en español
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    // Buscar los meses en la cadena
    const mesesEncontrados = [];
    
    for (const mes of meses) {
        if (nombreFormateado.toLowerCase().includes(mes)) {
            mesesEncontrados.push(mes);
        }
    }
    
    // Capitalizar los meses encontrados
    const mesesCapitalizados = mesesEncontrados.map(mes => 
        mes.charAt(0).toUpperCase() + mes.slice(1)
    );
    
    // Formatear como "Mes1-Mes2 Año" si hay al menos dos meses
    if (mesesCapitalizados.length >= 2) {
        return `${mesesCapitalizados[0]}-${mesesCapitalizados[1]} ${año}`;
    } 
    // Si solo hay un mes, formatear como "Mes Año"
    else if (mesesCapitalizados.length === 1) {
        return `${mesesCapitalizados[0]} ${año}`;
    }
    
    // Si no pudimos formatear adecuadamente, devolver el texto original con el año
    return `${nombreFormateado} ${año}`.trim();
}

function obtenerPeriodosDesdeBaseDeDatos() {
    fetch('../../periodos/obtener_periodos.php')
        .then(response => response.json())
        .then(periodos => {
            if (periodos.length > 0) {
                // Lógica para agregar opciones al select
                const selectElement = document.getElementById("periodo");
                selectElement.innerHTML = '<option value="">Seleccione un periodo creado</option>';
                
                // Recorrer cada periodo para agregarlo al select
                periodos.forEach(periodo => {
                    const nombreFormateado = formatearNombrePeriodo(periodo);
                    
                    // Agregar al select
                    const option = document.createElement("option");
                    option.value = periodo;
                    option.textContent = nombreFormateado;
                    selectElement.appendChild(option);
                    
                    // Aquí eliminamos la llamada a agregarBotonPeriodo
                    // Ya no se agregan botones, solo las opciones en el select
                });
            }
        })
        .catch(error => {
            console.error('Error al obtener los periodos:', error);
        });
}
// Al cargar la página, obtener periodos pero no cargar PDFs hasta que se seleccione un periodo
document.addEventListener("DOMContentLoaded", function() {
    obtenerPeriodosDesdeBaseDeDatos();
});
