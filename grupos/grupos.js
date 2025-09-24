// Función para actualizar la vista sin variables globales
function actualizarVista() {
    const turno = document.getElementById("turno").value;
    const abreviaturaTurno = turno === "Nocturno" ? "N" : "";  // Solo asigna "N" si es Nocturno
    const generacion = document.getElementById("generacion").value;
    const nomenclatura = document.getElementById("nomenclatura").value.toUpperCase();
    const grado = document.getElementById("grado").value;
    const grupo = `${generacion}${nomenclatura}${grado}${abreviaturaTurno}`;
    document.getElementById("grupoGenerado").value = grupo;
}

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

function guardarDatos() {
    const periodo = document.getElementById("periodo").value;
    const turno = document.getElementById("turno").value;
    const nivel = document.getElementById("nivel").value;
    const extension = document.getElementById("extension").value;
    const generacion = document.getElementById("generacion").value;
    const nomenclatura = document.getElementById("nomenclatura").value;
    const grado = document.getElementById("grado").value;
    const grupo = document.getElementById("grupoGenerado").value;

    if (!periodo || !turno || !nivel || !extension || !generacion || !nomenclatura || !grado) {
        alert("Por favor, complete todos los campos");
        return;
    }

    // Verificar si hay una fila seleccionada (modo edición)
    const filaSeleccionada = document.querySelector('.seleccionada');
    let datos;

    if (filaSeleccionada) {
        // Modo edición: obtener el grupo original de la fila seleccionada
        const grupoOriginal = filaSeleccionada.querySelector('td:nth-child(8)').textContent;

        datos = {
            accion: 'editar',
            periodo: periodo,
            grupoOriginal: grupoOriginal,
            turno: turno,
            nivel: nivel,
            extension: extension,
            generacion: generacion,
            nomenclatura: nomenclatura,
            grado: grado,
            grupo: grupo
        };
    } else {
        // Modo inserción: crear un nuevo registro
        datos = {
            accion: 'insertar',
            periodo: periodo,
            turno: turno,
            nivel: nivel,
            extension: extension,
            generacion: generacion,
            nomenclatura: nomenclatura,
            grado: grado,
            grupo: grupo
        };
    }

    fetch('procesar_grupos.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (filaSeleccionada) {
                alert("Grupo actualizado exitosamente");
                // Quitar la selección y el color de la fila
                filaSeleccionada.classList.remove('seleccionada');
                filaSeleccionada.style.backgroundColor = '';
            } else {
                alert("Grupo guardado exitosamente");
            }

            // Refresh the table immediately
            mostrarGrupos();
            // Clear form fields or reset as needed
            document.getElementById("turno").value = "";
            document.getElementById("nivel").value = "";
            document.getElementById("extension").value = "";
            document.getElementById("generacion").value = "";
            document.getElementById("nomenclatura").value = "";
            document.getElementById("grado").value = "";
            document.getElementById("grupoGenerado").value = "";
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Ocurrió un error al procesar los datos");
    });
}

// 1. First, let's modify mostrarGrupos()
function mostrarGrupos() {
    const periodoSeleccionado = document.getElementById('periodo').value;
    const tablaGrupos = document.getElementById('tablaDatos');

    if (!periodoSeleccionado) {
        tablaGrupos.innerHTML = '';
        return;
    }

    tablaGrupos.innerHTML = '<tr><td colspan="9" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';

    fetch(`obtener_grupos.php?periodo=${periodoSeleccionado}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
    })
    .then(data => {
        tablaGrupos.innerHTML = '';
        if (data.length === 0) {
            tablaGrupos.innerHTML = '<tr><td colspan="9" class="text-center">No hay grupos registrados para este periodo</td></tr>';
        } else {
            data.forEach((grupo) => {
                const fila = document.createElement('tr');
                // Format the period name here
                const periodoFormateado = formatearNombrePeriodo(grupo.periodo || '');
                
                fila.innerHTML = `
                    <td>${periodoFormateado}</td>
                    <td>${grupo.turno || ''}</td>
                    <td>${grupo.nivel || ''}</td>
                    <td>${grupo.extension || ''}</td>
                    <td>${grupo.generacion || ''}</td>
                    <td>${grupo.nomenclatura || ''}</td>
                    <td>${grupo.grado || ''}</td>
                    <td>${grupo.grupo || ''}</td>
                    <td style="display: flex; justify-content: center; align-items: center;">
                        <button class="btnEliminar" onclick="eliminarGrupo('${grupo.grupo}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>


                `;
                fila.addEventListener('click', function(e) {
                    // Evitar que el evento click se propague si se hizo clic en el botón eliminar
                    if (e.target.tagName === 'BUTTON' || e.target.parentNode.tagName === 'BUTTON' || e.target.tagName === 'I') {
                        e.stopPropagation();
                        return;
                    }
                    seleccionarFila(this);
                });
                tablaGrupos.appendChild(fila);
            });
        }
    })
    .catch(error => {
        console.error("Error al obtener los grupos:", error);
        tablaGrupos.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error al cargar los grupos. Intente nuevamente.</td></tr>';
    });
}
mostrarGrupos();
// 2. Now let's modify actualizarTablaModal()
function actualizarTablaModal() {
    const periodoSeleccionado = document.getElementById('periodo').value;

    if (!periodoSeleccionado) {
        document.getElementById("modal-tablaDatos").innerHTML = '<tr><td colspan="8" class="text-center">Seleccione un periodo primero</td></tr>';
        return;
    }

    fetch(`obtener_grupos.php?periodo=${periodoSeleccionado}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(datos => {
            console.log(datos);
            const tablaBody = document.getElementById("modal-tablaDatos");
            tablaBody.innerHTML = "";

            if (datos.length === 0) {
                tablaBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay grupos registrados para este periodo</td></tr>';
                return;
            }

            // Store formatted data for filtering later
            const datosFormateados = datos.map(dato => {
                return {
                    ...dato,
                    periodoFormateado: formatearNombrePeriodo(dato.periodo || '')
                };
            });

            datosFormateados.forEach((dato) => {
                let fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${dato.periodoFormateado}</td>
                    <td>${dato.turno || ''}</td>
                    <td>${dato.nivel || ''}</td>
                    <td>${dato.extension || ''}</td>
                    <td>${dato.generacion || ''}</td>
                    <td>${dato.nomenclatura || ''}</td>
                    <td>${dato.grado || ''}</td>
                    <td>${dato.grupo || ''}</td>
                `;
                tablaBody.appendChild(fila);
            });

            // Store both original and formatted data
            localStorage.setItem("grupos", JSON.stringify(datosFormateados));
        })
        .catch(error => {
            console.error('Error al actualizar la tabla del modal:', error);
            document.getElementById("modal-tablaDatos").innerHTML =
                '<tr><td colspan="8" class="text-center text-danger">Error al cargar los datos. Asegúrese de que el periodo seleccionado existe.</td></tr>';
        });
}

// 3. Update filtrarTabla() to use formatted periods
function filtrarTabla() {
    const turno = document.getElementById("modal-turno").value;
    const nivel = document.getElementById("modal-nivel").value;
    const extension = document.getElementById("modal-extension").value;
    const grupo = document.getElementById("modal-grupo").value;

    const datos = JSON.parse(localStorage.getItem("grupos")) || [];
    const datosFiltrados = datos.filter(d => {
        return (turno ? d.turno.includes(turno) : true) &&
               (nivel ? d.nivel.includes(nivel) : true) &&
               (extension ? d.extension.includes(extension) : true) &&
               (grupo ? d.grupo.includes(grupo) : true);
    });

    const tabla = document.getElementById("modal-tablaDatos");
    tabla.innerHTML = datosFiltrados.map(d =>
        `<tr>
            <td>${d.periodoFormateado || formatearNombrePeriodo(d.periodo)}</td>
            <td>${d.turno}</td>
            <td>${d.nivel}</td>
            <td>${d.extension}</td>
            <td>${d.generacion}</td>
            <td>${d.nomenclatura}</td>
            <td>${d.grado}</td>
            <td>${d.grupo}</td>
        </tr>`).join('');
}

// 4. Update rehacerTabla() to use formatted periods
function rehacerTabla() {
    document.getElementById("modal-turno").value = "";
    document.getElementById("modal-nivel").value = "";
    document.getElementById("modal-extension").value = "";
    document.getElementById("modal-grupo").value = "";

    const datos = JSON.parse(localStorage.getItem("grupos")) || [];
    const tabla = document.getElementById("modal-tablaDatos");

    tabla.innerHTML = datos.map(d =>
        `<tr>
            <td>${d.periodoFormateado || formatearNombrePeriodo(d.periodo)}</td>
            <td>${d.turno}</td>
            <td>${d.nivel}</td>
            <td>${d.extension}</td>
            <td>${d.generacion}</td>
            <td>${d.nomenclatura}</td>
            <td>${d.grado}</td>
            <td>${d.grupo}</td>
        </tr>`
    ).join('');
}

// 5. Update the PDF and Excel functions to use formatted periods
function descargarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const periodoSeleccionado = document.getElementById('periodo').value;
    
    if (!periodoSeleccionado) {
        alert("Por favor, seleccione un periodo antes de exportar");
        return;
    }

    // Título centrado y en negritas
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text("Grupos", doc.internal.pageSize.width / 2, 20, { align: "center" });

    // Usamos los datos del modal que ya no contienen botones de eliminar
    const tabla = document.getElementById("modal-tablaDatos");
    
    // Si la tabla del modal está vacía, la actualizamos primero
    if (tabla.rows.length === 0) {
        // Hacemos una llamada sincrónica para obtener los datos
        fetch(`obtener_grupos.php?periodo=${periodoSeleccionado}`)
            .then(response => response.json())
            .then(data => {
                const datosTabla = data.map(grupo => [
                    formatearNombrePeriodo(grupo.periodo || ''),
                    grupo.turno || '',
                    grupo.nivel || '',
                    grupo.extension || '',
                    grupo.generacion || '',
                    grupo.nomenclatura || '',
                    grupo.grado || '',
                    grupo.grupo || ''
                ]);

                // Agregar tabla con estilo
                doc.autoTable({
                    head: [['Periodo', 'Turno', 'Nivel', 'Extensión', 'Generación', 'Nomenclatura', 'Grado', 'Grupo']],
                    body: datosTabla,
                    headStyles: {
                        fillColor: [0, 128, 0],
                        textColor: [255, 255, 255],
                        fontSize: 10,
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    bodyStyles: {
                        fillColor: [255, 255, 255],
                        textColor: [0, 0, 0],
                        fontSize: 9,
                        halign: 'center'
                    },
                    theme: 'grid',
                    margin: { top: 30, left: 10, right: 10, bottom: 10 }
                });

                // Descargar el archivo PDF
                doc.save('registros.pdf');
            })
            .catch(error => {
                console.error("Error al obtener datos para PDF:", error);
                alert("Ocurrió un error al generar el PDF");
            });
    } else {
        // Usar los datos existentes en la tabla del modal
        const filas = tabla.querySelectorAll("tr");
        const datosTabla = Array.from(filas).map(fila => {
            const celdas = fila.querySelectorAll("td");
            return Array.from(celdas).map(celda => celda.textContent);
        });

        // Agregar tabla con estilo
        doc.autoTable({
            head: [['Periodo', 'Turno', 'Nivel', 'Extensión', 'Generación', 'Nomenclatura', 'Grado', 'Grupo']],
            body: datosTabla,
            headStyles: {
                fillColor: [0, 128, 0],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 9,
                halign: 'center'
            },
            theme: 'grid',
            margin: { top: 30, left: 10, right: 10, bottom: 10 }
        });

        // Descargar el archivo PDF
        doc.save('registros.pdf');
    }
}

// Agrega esto al final de tu archivo JavaScript o donde sea apropiado
document.addEventListener("DOMContentLoaded", function() {
    // Conectar el botón de actualizar a la función actualizarGrupo
    const btnActualizar = document.getElementById("btnActualizar");
    if (btnActualizar) {
        btnActualizar.addEventListener("click", actualizarGrupo);
    }
});



// Modificar la función abrirModal para que NO copie directamente el HTML
function abrirModal() {
    // En lugar de copiar el HTML, simplemente actualizamos la tabla del modal
    actualizarTablaModal();
    document.getElementById("modal").style.display = "flex";
}




document.addEventListener("DOMContentLoaded", function() {
    // Initial loading
    obtenerPeriodosDesdeBaseDeDatos();

    // Set up event listener for period selection
    const periodoSelect = document.getElementById("periodo");
    periodoSelect.addEventListener("change", function() {
        mostrarGrupos();
    });

    // Connect form fields for grupo generation
    const formFields = ["turno", "generacion", "nomenclatura", "grado"];
    formFields.forEach(id => {
        document.getElementById(id).addEventListener("change", actualizarVista);
    });

});

function seleccionarFila(fila) {
    // Obtener los datos de la fila seleccionada
    const celdas = fila.querySelectorAll('td');

    // Rellenar el formulario con los datos de la fila seleccionada
    document.getElementById("turno").value = celdas[1].textContent; // Turno está en la segunda columna
    document.getElementById("nivel").value = celdas[2].textContent; // Nivel está en la tercera columna
    document.getElementById("extension").value = celdas[3].textContent;
    document.getElementById("generacion").value = celdas[4].textContent;
    document.getElementById("nomenclatura").value = celdas[5].textContent;
    document.getElementById("grado").value = celdas[6].textContent;
    document.getElementById("grupoGenerado").value = celdas[7].textContent;

    // Marcar la fila seleccionada con un color
    const filaSeleccionada = document.querySelector('.seleccionada');
    if (filaSeleccionada) {
        filaSeleccionada.classList.remove('seleccionada');
        filaSeleccionada.style.backgroundColor = ''; // Quitar el color de fondo
    }

    fila.classList.add('seleccionada');
    fila.style.backgroundColor = '#FFD580'; // Color naranja claro
}

function actualizarGrupo() {
    const turno = document.getElementById("turno").value;
    const nivel = document.getElementById("nivel").value;
    const extension = document.getElementById("extension").value;
    const generacion = document.getElementById("generacion").value;
    const nomenclatura = document.getElementById("nomenclatura").value;
    const grado = document.getElementById("grado").value;
    const grupoGenerado = document.getElementById("grupoGenerado").value;
    const periodo = document.getElementById("periodo").value;

    // Obtener el grupo original (el que se está editando)
    const filaSeleccionada = document.querySelector('.seleccionada');
    if (!filaSeleccionada) {
        alert("No hay grupo seleccionado.");
        return;
    }

    // Obtener el grupo original de la fila seleccionada
    const grupoOriginal = filaSeleccionada.querySelector('td:nth-child(8)').textContent;

    // Datos para actualizar
    const datos = {
        accion: 'editar',
        periodo: periodo,
        grupoOriginal: grupoOriginal,
        turno,
        nivel,
        extension,
        generacion,
        nomenclatura,
        grado,
        grupo: grupoGenerado
    };

    fetch('procesar_grupos.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Grupo actualizado correctamente");
            mostrarGrupos(); // Para refrescar la tabla después de actualizar

            // Limpiar el formulario después de la actualización
            document.getElementById("turno").value = "";
            document.getElementById("nivel").value = "";
            document.getElementById("extension").value = "";
            document.getElementById("generacion").value = "";
            document.getElementById("nomenclatura").value = "";
            document.getElementById("grado").value = "";
            document.getElementById("grupoGenerado").value = "";

            // Eliminar la clase seleccionada de la fila
            filaSeleccionada.classList.remove('seleccionada');
        } else {
            alert("Error al actualizar el grupo: " + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Hubo un problema con la solicitud.");
    });
}



// Función para cerrar el modal sin variables globales
function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}





document.addEventListener("DOMContentLoaded", function() {
    async function descargarExcel() {
        // Obtener los datos de la tabla principal, pero sin la columna de eliminar
        const periodoSeleccionado = document.getElementById('periodo').value;
        if (!periodoSeleccionado) {
            alert("Por favor, seleccione un periodo antes de exportar");
            return;
        }

        try {
            // Obtener los datos directamente de la API
            const response = await fetch(`obtener_grupos.php?periodo=${periodoSeleccionado}`);
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            const grupos = await response.json();
            
            if (grupos.length === 0) {
                alert("No hay datos para exportar a Excel");
                return;
            }

            var workbook = new ExcelJS.Workbook();
            var worksheet = workbook.addWorksheet("Grupos");

            // Encabezado "Grupos" en la primera fila (A1:H1)
            worksheet.mergeCells('A1:H1');
            worksheet.getCell('A1').value = "Grupos";
            worksheet.getCell('A1').font = { bold: true, size: 22 };
            worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '008F39' } };
            worksheet.getCell('A1').font = { color: { argb: 'FFFFFFFF' }, bold: true };

            // Encabezado de la tabla con las columnas en la fila 2 (A2:H2)
            const encabezado = ["Periodo", "Turno", "Nivel", "Extensión", "Generación", "Nomenclatura", "Grado", "Grupo"];

            // Añadir encabezado en la fila 2 (A2:H2)
            encabezado.forEach((valor, index) => {
                const cell = worksheet.getCell(2, index + 1);
                cell.value = valor;
                cell.font = { bold: true, size: 12 };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '008F39' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };

                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Agregar las filas a la hoja
            grupos.forEach((grupo, rowIndex) => {
                // Format the period name
                const periodoFormateado = formatearNombrePeriodo(grupo.periodo || '');
                
                // Creamos un array con solo los datos que queremos exportar (sin incluir botones)
                const rowData = [
                    periodoFormateado,
                    grupo.turno || '',
                    grupo.nivel || '',
                    grupo.extension || '',
                    grupo.generacion || '',
                    grupo.nomenclatura || '',
                    grupo.grado || '',
                    grupo.grupo || ''
                ];
                
                // Crear una nueva fila en la hoja
                const excelRow = worksheet.addRow(rowData);

                // Aplicar formato a cada celda
                excelRow.eachCell((cell, colNumber) => {
                    cell.font = { color: { argb: '000000' } };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Ajustar el ancho de las columnas
            worksheet.columns.forEach(column => {
                column.width = 18;
            });

            // Descargar archivo Excel
            await workbook.xlsx.writeBuffer().then(function (buffer) {
                var blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                var link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'grupos.xlsx';
                link.click();
            });
        } catch (error) {
            console.error("Error al exportar a Excel:", error);
            alert("Ocurrió un error al exportar a Excel. Por favor, inténtelo de nuevo.");
        }
    }

    // Añadir evento al botón de descarga
    const descargarBtn = document.getElementById('descargarBtn');
    if (descargarBtn) {
        descargarBtn.addEventListener('click', descargarExcel);
    }
});



function eliminarGrupo(grupo) {
    // Mostrar un diálogo de confirmación
    if (confirm("¿Está seguro que desea eliminar este grupo? Esta acción no se puede deshacer.")) {
        const periodoSeleccionado = document.getElementById('periodo').value;

        // Verificar que haya un periodo seleccionado
        if (!periodoSeleccionado) {
            alert("Error: Debe seleccionar un periodo para eliminar un grupo.");
            return;
        }

        // Preparar los datos para enviar al servidor
        const datos = {
            accion: 'eliminar',
            periodo: periodoSeleccionado,
            grupo: grupo
        };

        // Enviar la solicitud al servidor
        fetch('procesar_grupos.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Grupo eliminado correctamente.");
                // Actualizar la tabla de grupos
                mostrarGrupos();
            } else {
                alert("Error al eliminar el grupo: " + (data.error || "Error desconocido"));
            }
        })
        .catch(error => {
            console.error("Error al eliminar el grupo:", error);
            alert("Ocurrió un error al eliminar el grupo.");
        });
    }
}


function imprimirTabla() {
    console.log("Print function called");

    // Ajustar el tamaño de la tabla antes de imprimir
    document.querySelector('.table-container').style.width = '100%';
    
    // Verificar si hay datos en la tabla
    const numFilas = document.getElementById('tablaDatos').rows.length;
    
    if (numFilas === 0) {
        alert('No hay datos para imprimir');
        return;
    }

    // Create a clone of the table container
    const tableContainer = document.querySelector('.table-container').cloneNode(true);
    
    // Format the period names in the cloned table
    const tableCells = tableContainer.querySelectorAll('tbody tr td:first-child');
    tableCells.forEach(cell => {
        const periodValue = cell.textContent;
        cell.textContent = formatearNombrePeriodo(periodValue);
    });

    // Crear un iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    
    // Añadir el iframe al documento
    document.body.appendChild(iframe);
    
    // Esperar a que el iframe se cargue
    iframe.onload = function() {
        try {
            // Escribir el contenido en el iframe
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Imprimir Tabla</title>
                    <style>
                        /* Estilos generales para la impresión */
                        @media print {
                            /* Ocultar todo primero */
                            body * {
                                visibility: hidden;
                            }

                            /* Solo mostrar el contenedor de la tabla y sus elementos */
                            .table-container, .table-container * {
                                visibility: visible;
                            }

                            /* Controlar márgenes de página */
                            @page {
                                size: auto;
                                margin: 10mm;
                            }

                            /* Estilo específico para el contenedor de la tabla */
                            .table-container {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: auto;
                                background-color: transparent;
                                padding: 0;
                                margin: 0;
                                overflow: visible;
                                page-break-before: always;
                            }

                            /* Estilos para la tabla */
                            .table-container table {
                                width: 90%;
                                margin: 0 auto;
                                border-collapse: collapse;
                                table-layout: fixed;
                                font-size: 9px;
                                page-break-inside: avoid;
                            }

                            .table-container th, 
                            .table-container td {
                                padding: 4px;
                                font-size: 9px;
                                text-align: center;
                                border: 1px solid #ddd;
                            }

                            .table-container th {
                                background-color: #008f39;
                                color: white;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }

                            .total-horas {
                                font-weight: bold;
                                background-color: #f4f4f4 !important;
                            }

                            .table-container h3 {
                                text-align: center;
                                margin-bottom: 5mm;
                                font-size: 12px;
                            }

                            /* Ocultar elementos que no deseas en la impresión */
                            .table-container th:last-child,
                            .table-container td:last-child {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${tableContainer.outerHTML}
                </body>
                </html>
            `);
            doc.close();
            
            // Imprimir el contenido del iframe
            console.log("Printing iframe content");
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // Eliminar el iframe después de imprimir
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
        } catch (error) {
            console.error("Error with iframe printing:", error);
            document.body.removeChild(iframe);
        }
    };
    
    // Establecer una fuente para el iframe
    iframe.src = 'about:blank';
}