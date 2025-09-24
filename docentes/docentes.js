const formDocente = document.getElementById('formDocente');
const tablaDocentes = document.getElementById('tablaDocentes');
const docenteId = document.getElementById('docenteId');
const docenteModal = new bootstrap.Modal(document.getElementById('docenteModal'));
let docentes = [];


document.getElementById('horas').addEventListener('input', function(e) {
    let horasValue = e.target.value;

    // Aseguramos que el valor sea un número y no más de dos dígitos
    if (horasValue.length > 2) {
        horasValue = horasValue.substring(0, 2); // Solo los primeros dos dígitos
    }
    // Actualizamos el campo con el valor formateado
    e.target.value = horasValue;
});


// Modificar el input de horas en el HTML
document.getElementById('horas').setAttribute('min', '1');
document.getElementById('horas').setAttribute('max', '40');

// Agregar HTML para el modal de contraseña
const passwordModalHTML = `
<div class="modal fade" id="passwordModal" tabindex="-1" aria-labelledby="passwordModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="passwordModalLabel">Verificación de administrador</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Las horas exceden el límite de 40. Ingrese la clave de administrador para continuar:</p>
        <div class="input-group mb-3">
          <input type="password" id="adminPassword" class="form-control" placeholder="Contraseña">
          <button class="btn btn-outline-secondary" type="button" id="togglePassword">
            <i class="bi bi-eye"></i>
          </button>
        </div>
        <div id="passwordError" class="text-danger" style="display: none;">
          Clave incorrecta. Intente de nuevo.
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="confirmPassword">Confirmar</button>
      </div>
    </div>
  </div>
</div>
`;


// Insertar el HTML del modal en el documento
document.body.insertAdjacentHTML('beforeend', passwordModalHTML);

// Inicializar el modal de contraseña
const passwordModal = new bootstrap.Modal(document.getElementById('passwordModal'));

// Función para verificar la contraseña de administrador
function verificarContrasenaAdmin(callback) {
    // Limpiar posibles errores anteriores
    document.getElementById('passwordError').style.display = 'none';
    document.getElementById('adminPassword').value = '';
    
    // Mostrar el modal
    passwordModal.show();
    
    // Configurar el evento para mostrar/ocultar contraseña
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('adminPassword');
    
    toggleBtn.addEventListener('click', function() {
        // Cambiar el tipo de input entre password y text
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Cambiar el icono
        const icon = toggleBtn.querySelector('i');
        icon.classList.toggle('bi-eye');
        icon.classList.toggle('bi-eye-slash');
    });
    
    // Configurar el botón de confirmar
    const confirmBtn = document.getElementById('confirmPassword');
    confirmBtn.onclick = function() {
        const password = passwordInput.value;
        const claveAdministrador = "admin123";
        
        if (password === claveAdministrador) {
            passwordModal.hide();
            callback(true); // Contraseña correcta
        } else {
            document.getElementById('passwordError').style.display = 'block';
            callback(false); // Contraseña incorrecta
        }
    };
    
    // Configurar el botón de cancelar
    const cancelBtn = document.querySelector('#passwordModal .btn-secondary');
    cancelBtn.onclick = function() {
        passwordModal.hide();
        callback(false); // Se canceló la operación
    };
    
    // También cancelar si se cierra el modal con el botón X
    document.querySelector('#passwordModal .btn-close').onclick = function() {
        passwordModal.hide();
        callback(false);
    };
}

// Agregar evento para controlar el cambio en el campo de horas
document.getElementById('horas').addEventListener('change', function(e) {
    const horasValue = parseInt(this.value);
    const horasInput = this;
    
    // Si se intenta ingresar más de 40 horas
    if (horasValue > 40) {
        verificarContrasenaAdmin(function(esValido) {
            if (esValido) {
                // Si la clave es correcta, permitir el valor ingresado
                horasInput.setAttribute('max', horasValue);
            } else {
                // Si la clave es incorrecta o se canceló, restablecer a 40
                horasInput.value = 40;
                horasInput.setAttribute('max', '40');
            }
        });
    } else {
        // Restaurar el límite original si el valor está dentro del rango normal
        this.setAttribute('max', '40');
    }
});



formDocente.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = docenteId.value;  // Este ID debe ser usado para actualizar, si está vacío es inserción
    const nombreCompleto = document.getElementById('nombreCompleto').value;
    const regimen = document.getElementById('regimen').value;
    const horas = parseInt(document.getElementById('horas').value);
    const periodoSeleccionado = document.getElementById('periodo').value;
    
    // Validaciones
    if (!periodoSeleccionado) {
        alert("Error: Debe seleccionar un periodo.");
        return;
    }
    
    if (horas < 1) {
        alert("Error: El número de horas debe ser al menos 1.");
        return;
    }
    
    // Preparar los datos para enviar al servidor
    const datos = {
        id: id || undefined,  // Si hay un ID, lo usamos, si no, se considera undefined
        accion: id ? 'editar' : 'insertar',  // Determinamos si es insertar o editar
        periodo: periodoSeleccionado,
        nombreCompleto: nombreCompleto,
        regimen: regimen,
        horas: horas
    };
    
    // Usar una única URL para ambas operaciones
    fetch('procesar_docente.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(id ? "Docente actualizado correctamente." : "Docente agregado correctamente.");
            mostrarDocentes();
            resetForm();
            docenteModal.hide();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => {
        console.error("Error al enviar los datos:", error);
        alert("Ocurrió un error al enviar los datos.");
    });
});

function editarDocente(id) {
    fetch(`obtener_docentes.php?periodo=${document.getElementById('periodo').value}`)
        .then(response => response.json())
        .then(data => {
            const docente = data.find(d => d.id == id);
            if (docente) {
                document.getElementById('docenteId').value = docente.id;
                document.getElementById('nombreCompleto').value = docente.nombreCompleto;
                document.getElementById('regimen').value = docente.regimen;
                document.getElementById('horas').value = docente.horas;
                docenteModal.show();
            }
        })
        .catch(error => {
            console.error("Error al obtener el docente:", error);
            alert("Ocurrió un error al obtener la información del docente.");
        });
}








// Agregar un listener de eventos al select de periodos para cargar docentes cuando cambie
document.addEventListener("DOMContentLoaded", function() {
    obtenerPeriodosDesdeBaseDeDatos();
    
    const periodoSelect = document.getElementById('periodo');
    
    // Evento change para cargar docentes cuando cambie el periodo seleccionado
    periodoSelect.addEventListener('change', function() {
        if (this.value) {
            mostrarDocentes();
        } else {
            // Si no hay periodo seleccionado, limpiar la tabla
            document.getElementById('tablaDocentes').innerHTML = '';
        }
    });
});

// Función para cargar docentes cuando se selecciona un periodo
document.getElementById('periodo').addEventListener('change', function() {
    mostrarDocentes();
});
// Mejorar la función mostrarDocentes para incluir un indicador de carga
function mostrarDocentes() {
    const periodoSeleccionado = document.getElementById('periodo').value;
    const tablaDocentes = document.getElementById('tablaDocentes');
    
    if (!periodoSeleccionado) {
        tablaDocentes.innerHTML = '';
        return;
    }
    
    // Mostrar indicador de carga
    tablaDocentes.innerHTML = '<tr><td colspan="4" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';
    
    fetch(`obtener_docentes.php?periodo=${periodoSeleccionado}`)
        .then(response => response.json())
        .then(data => {
            tablaDocentes.innerHTML = '';
            docentes = data;
            
            // Cargar el estado guardado antes de mostrar los docentes
            cargarEstadoDocentes();
            
            if (data.length === 0) {
                // Mostrar mensaje si no hay docentes
                tablaDocentes.innerHTML = '<tr><td colspan="4" class="text-center">No hay docentes registrados en este periodo.</td></tr>';
                return;
            }
            
            // Mostrar los docentes en la tabla
            data.forEach(docente => {
                const fila = document.createElement('tr');
                fila.dataset.id = docente.id;
                
                // Verificar estado (para la funcionalidad visual de habilitado/deshabilitado)
                const estaDeshabilitado = docente.deshabilitado === true;
                if (estaDeshabilitado) {
                    fila.classList.add('table-secondary');
                    fila.dataset.estado = 'deshabilitado';
                } else {
                    fila.dataset.estado = 'habilitado';
                }
                
                fila.innerHTML = `
                    <td>${docente.nombreCompleto}</td>
                    <td>${docente.regimen}</td>
                    <td>${docente.horas}</td>
                    <td>
                        <button class="btn ${estaDeshabilitado ? 'btn-success' : 'btn-secondary'} btn-sm toggle-estado" 
                                onclick="toggleEstadoVisual(${docente.id})">
                            ${estaDeshabilitado ? 'Habilitar' : 'Deshabilitar'}
                        </button>
                        <button class="btn btn-warning btn-sm ms-1 btn-editar" 
                                onclick="editarDocente(${docente.id})" 
                                ${estaDeshabilitado ? 'disabled' : ''}>Editar</button>
                        <button class="btn btn-danger btn-sm ms-1" 
                                onclick="eliminarDocente(${docente.id})" 
                                ${estaDeshabilitado ? 'disabled' : ''}>Eliminar</button>
                    </td>
                `;
                
                tablaDocentes.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("Error al obtener los docentes:", error);
            tablaDocentes.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar docentes. Intente nuevamente.</td></tr>';
        });
}







// Función para guardar el estado de los docentes deshabilitados en sessionStorage
function guardarEstadoDocentes() {
    const docentesDeshabilitados = {};
    docentes.forEach(docente => {
        if (docente.deshabilitado) {
            docentesDeshabilitados[docente.id] = true;
        }
    });
    
    const periodoSeleccionado = document.getElementById('periodo').value;
    sessionStorage.setItem(`docentesDeshabilitados_${periodoSeleccionado}`, JSON.stringify(docentesDeshabilitados));
}

// Función para cargar el estado de los docentes deshabilitados desde sessionStorage
function cargarEstadoDocentes() {
    const periodoSeleccionado = document.getElementById('periodo').value;
    const estadoGuardado = sessionStorage.getItem(`docentesDeshabilitados_${periodoSeleccionado}`);
    
    if (estadoGuardado) {
        const docentesDeshabilitados = JSON.parse(estadoGuardado);
        
        // Aplicar el estado guardado a los docentes cargados
        docentes.forEach(docente => {
            if (docentesDeshabilitados[docente.id]) {
                docente.deshabilitado = true;
            }
        });
    }
}

// Modificar la función toggleEstadoVisual para guardar el estado
function toggleEstadoVisual(id) {
    // Lógica actual del toggle...
    const fila = document.querySelector(`tr[data-id="${id}"]`);
    
    if (!fila) return;
    
    // Cambiar el estado visual
    const estaDeshabilitado = fila.dataset.estado === 'deshabilitado';
    
    if (estaDeshabilitado) {
        // Código para habilitar...
        fila.classList.remove('table-secondary');
        fila.dataset.estado = 'habilitado';
        
        // Habilitar botones
        const botonesEditar = fila.querySelectorAll('.btn-editar');
        const botonesEliminar = fila.querySelectorAll('.btn-danger');
        
        botonesEditar.forEach(btn => btn.removeAttribute('disabled'));
        botonesEliminar.forEach(btn => btn.removeAttribute('disabled'));
        
        // Cambiar texto y clase del botón
        const botonToggle = fila.querySelector('.toggle-estado');
        botonToggle.textContent = 'Deshabilitar';
        botonToggle.classList.remove('btn-success');
        botonToggle.classList.add('btn-secondary');
    } else {
        // Código para deshabilitar...
        fila.classList.add('table-secondary');
        fila.dataset.estado = 'deshabilitado';
        
        // Deshabilitar botones
        const botonesEditar = fila.querySelectorAll('.btn-editar');
        const botonesEliminar = fila.querySelectorAll('.btn-danger');
        
        botonesEditar.forEach(btn => btn.setAttribute('disabled', 'disabled'));
        botonesEliminar.forEach(btn => btn.setAttribute('disabled', 'disabled'));
        
        // Cambiar texto y clase del botón
        const botonToggle = fila.querySelector('.toggle-estado');
        botonToggle.textContent = 'Habilitar';
        botonToggle.classList.remove('btn-secondary');
        botonToggle.classList.add('btn-success');
    }
    
    // Actualizar el estado en nuestro array local de docentes
    const docente = docentes.find(d => d.id == id);
    if (docente) {
        docente.deshabilitado = !estaDeshabilitado;
        
        // Guardar el estado actualizado
        guardarEstadoDocentes();
    }
}






// Añadir estilo CSS para las filas deshabilitadas
const style = document.createElement('style');
style.textContent = `
    tr.table-secondary {
        opacity: 0.7;
        color: #6c757d;
    }
    
    tr.table-secondary button:not(.toggle-estado) {
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);








function resetForm() {
    formDocente.reset();
    docenteId.value = '';
    // Restaurar el límite a 40 al resetear el formulario
    document.getElementById('horas').setAttribute('max', '40');
}


// Modificar la función obtenerPeriodosDesdeBaseDeDatos para seleccionar automáticamente
// el primer periodo y cargar sus datos



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
            const selectElement = document.getElementById("periodo");
            
            // Limpiar el select antes de agregar los nuevos periodos
            selectElement.innerHTML = '<option value="">Seleccione un periodo creado</option>';
            
            if (periodos.length > 0) {
                // Recorrer la lista de periodos y agregar cada uno como una opción
                periodos.forEach(periodo => {
                    const nombreFormateado = formatearNombrePeriodo(periodo);
                    
                    const option = document.createElement("option");
                    option.value = periodo;
                    option.textContent = nombreFormateado;
                    selectElement.appendChild(option);
                });
                
                // Seleccionar automáticamente el primer periodo y cargar sus docentes
                // Si prefieres que se seleccione el periodo más reciente, puedes ordenar el array de periodos antes
                selectElement.value = periodos[0];
                
                // Disparar el evento change para que se carguen los docentes
                const event = new Event('change');
                selectElement.dispatchEvent(event);
            }
        })
        .catch(error => {
            console.error('Error al obtener los periodos:', error);
        });
}


function eliminarDocente(id) {
    docentes = docentes.filter(docente => docente.id !== id);
    mostrarDocentes();
}

        // Función para eliminar docente
function eliminarDocente(id) {
    // Mostrar un diálogo de confirmación
    if (confirm("¿Está seguro que desea eliminar este docente? Esta acción no se puede deshacer.")) {
        const periodoSeleccionado = document.getElementById('periodo').value;
        
        // Verificar que haya un periodo seleccionado
        if (!periodoSeleccionado) {
            alert("Error: Debe seleccionar un periodo para eliminar un docente.");
            return;
        }
        
        // Preparar los datos para enviar al servidor
        const datos = {
            id: id,
            accion: 'eliminar',
            periodo: periodoSeleccionado
        };
        
        // Enviar la solicitud al servidor
        fetch('procesar_docente.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Docente eliminado correctamente.");
                // Actualizar la tabla de docentes
                mostrarDocentes();
            } else {
                alert("Error al eliminar el docente: " + data.error);
            }
        })
        .catch(error => {
            console.error("Error al eliminar el docente:", error);
            alert("Ocurrió un error al eliminar el docente.");
        });
    }
}