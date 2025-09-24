// Variables globales
const fileInput = document.getElementById('file-input');
const savePdfBtn = document.getElementById('save-pdf-btn');
const pdfList = document.getElementById('pdf-list');
const pdfViewer = document.getElementById('pdf-viewer');
const pdfPreview = document.getElementById('pdf-preview');
const downloadBtn = document.getElementById('download-btn');
const closeBtn = document.getElementById('close-btn');
const periodoSelect = document.getElementById('periodo');

let selectedFile = null;
let selectedPeriodo = ""; // Variable para almacenar el periodo seleccionado

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
    selectedPeriodo = this.value;

    // Si hay un periodo seleccionado, cargar los PDFs automáticamente
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
    fetch(`obtener_pdfs.php?periodo=${periodo}`)
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
                    
                        // Crear el botón de eliminar con clase CSS
                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Eliminar';
                        deleteBtn.classList.add('btn-eliminar'); // Aquí agregamos la clase CSS
                        deleteBtn.style.marginLeft = '10px';
                        deleteBtn.onclick = () => {
                            eliminarPDF(pdf.id);  // Llamar a la función de eliminación con el ID del PDF
                        };
                    
                        // Agregar el evento de clic para visualizar el PDF
                        link.onclick = function() {
                            showPDFFromBase64(pdf.nombre_archivo, pdf.pdf_base64, li);
                        };

                        li.appendChild(link);
                        li.appendChild(deleteBtn);  // Agregar el botón de eliminar
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



// Evento para cerrar el visor de PDF
closeBtn.addEventListener('click', function() {
    pdfViewer.style.display = 'none';
    pdfPreview.src = '';
    downloadBtn.style.display = 'none';
});

// Llamar a la función con el periodo adecuado
loadFilesFromDatabase(periodo);  // Reemplaza con el periodo que quieras utilizar



// Función para eliminar el PDF
function eliminarPDF(id) {
    // Mostrar un diálogo de confirmación
    if (confirm("¿Está seguro que desea eliminar este PDF? Esta acción no se puede deshacer.")) {
        const periodoSeleccionado = document.getElementById('periodo').value;
        
        // Verificar que haya un periodo seleccionado
        if (!periodoSeleccionado) {
            alert("Error: Debe seleccionar un periodo para eliminar el PDF.");
            return;
        }
        
        // Preparar los datos para enviar al servidor
        const datos = {
            id: id,
            accion: 'eliminar',
            periodo: periodoSeleccionado
        };
        
        // Enviar la solicitud al servidor
        fetch('eliminar_pdf.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("PDF eliminado correctamente.");
                // Recargar la lista de PDFs
                loadFilesFromDatabase(periodoSeleccionado);
            } else {
                alert("Error al eliminar el PDF: " + data.error);
            }
        })
        .catch(error => {
            console.error("Error al eliminar el PDF:", error);
            alert("Ocurrió un error al eliminar el PDF.");
        });
    }
}



// Evento para seleccionar los archivos
fileInput.addEventListener('change', function(event) {
    const files = event.target.files; // Obtén todos los archivos seleccionados
    if (files.length > 0) {
        // Mostrar el botón "Guardar" si hay archivos seleccionados y un periodo
        if (selectedPeriodo) {
            savePdfBtn.style.display = 'inline-block';
        }
    } else {
        savePdfBtn.style.display = 'none';
    }
});

// Evento para guardar los archivos seleccionados
savePdfBtn.addEventListener('click', function() {
    if (selectedPeriodo && fileInput.files.length > 0) {
        const files = fileInput.files; // Obtener todos los archivos seleccionados
        Array.from(files).forEach(file => {
            // Leer cada archivo
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Data = e.target.result.split(',')[1]; // Obtener solo la parte base64

                // Enviar el archivo base64 y el periodo al servidor
                fetch('guardar_pdf.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        pdf_base64: base64Data,
                        periodo: selectedPeriodo,
                        nombre_archivo: file.name
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('PDF guardado correctamente');
                        // Actualizar la lista de PDFs automáticamente
                        loadFilesFromDatabase(selectedPeriodo);  // Recargar la lista de PDFs con el periodo seleccionado
                    } else {
                        alert('Error al guardar el PDF: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error al guardar el PDF:', error);
                    alert('Hubo un error al guardar el archivo');
                });
            };
            reader.readAsDataURL(file);  // Convierte el archivo a base64
        });
    }
});




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
    fetch('../periodos/obtener_periodos.php')
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