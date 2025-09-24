// Código del modo oscuro
const toggle = document.getElementById('darkModeToggle');
const body = document.body;

if (localStorage.getItem('darkMode') === 'true') {
    body.classList.add('dark-mode');
    toggle.checked = true;
}

toggle.addEventListener('change', () => {
    if (toggle.checked) {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    }
});

const toggleSwitch = document.getElementById('darkModeToggle');

toggleSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', toggleSwitch.checked);
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

// Evento para cargar los periodos cuando la página se haya cargado
document.addEventListener("DOMContentLoaded", function() {
obtenerPeriodosDesdeBaseDeDatos();
});




// Actaliza la parte superior de la tabla, para actualizar la información.
function actualizarInformacionCarrera() {
const nivel = document.getElementById("nivel").value;
const programaEducativo = document.getElementById("programa_educativo").value;
const turnoSelect = document.getElementById("turno");
let turno = turnoSelect.value;

// Si el nivel es "Ing" o "Lic", actualizar opciones de turno
if (nivel === "Ing" || nivel === "Lic") {
if (turno !== "TSUMAT" && turno !== "TSUNOC") {
    turno = "TSUMAT"; // Valor predeterminado
    turnoSelect.value = turno;
}
}

const infoCarrera = document.getElementById("informacion-carrera");
const programaEducativoTitle = document.getElementById("programa_educativo_title");

let nivelTexto = "";
if (nivel === "TSU") {
nivelTexto = "TÉCNICO SUPERIOR UNIVERSITARIO EN";
} else if (nivel === "Ing") {
nivelTexto = "INGENIERÍA EN";
} else if (nivel === "Lic") {
nivelTexto = "LICENCIATURA EN";
}

// Limpiar los campos antes de actualizarlos
if (programaEducativoTitle) programaEducativoTitle.textContent = "";
if (programaEducativoTitle) {
programaEducativoTitle.textContent = programaEducativo;
}

// Función para insertar saltos de línea después de un número específico de palabras
function formatProgramText(text) {
const words = text.split(' '); // Dividir el texto en palabras
let formattedText = '';
let lineLength = 3; // Comenzamos con 2 palabras por línea

for (let i = 0; i < words.length; i++) {
    formattedText += words[i] + ' ';
    if ((i + 1) % lineLength === 0) { // Cada 2 palabras en la primera línea
        formattedText += '<br>'; // Añadimos un salto de línea
        if (lineLength === 3) {
            lineLength = 5; // Después de la primera línea, cambiamos a 4 palabras por línea
        }
    }
}
return formattedText;
}

// Formatear el texto del programa educativo
const formattedProgramaEducativo = formatProgramText(programaEducativo);

// Crear el texto final para el div
let turnoText = "";
if (turno === "TSUMAT" || turno === "TSUNOC") {
turnoText = `<br><br>Turno Nocturno`;
} else if (turno !== "seleccionar") {
turnoText = `<br><br>Turno ${turno}`;
}

// Actualizar el contenido del div con los nuevos textos
if (infoCarrera) {
infoCarrera.innerHTML = ` 
    <p><strong>Distribución Cuatrimestral de la Carrera de</strong></p>
    <p><strong>${nivelTexto}</strong> <span id="programa_educativo_title" style="font-weight: bold">${formattedProgramaEducativo}</span></p>
    <p style="margin-top: 0;"><strong>EN COMPETENCIAS PROFESIONALES${turnoText}</strong></p>
`;
}

// Actualizar el footer con la información del turno
actualizarFooter();
}
document.getElementById("nivel").addEventListener("change", actualizarInformacionCarrera);
document.getElementById("programa_educativo").addEventListener("input", actualizarInformacionCarrera);
document.getElementById("turno").addEventListener("change", actualizarInformacionCarrera);
document.getElementById("turno").addEventListener("change", function() {
// Reemplazar actualizarCarrera con actualizarInformacionCarrera
actualizarInformacionCarrera();
actualizarTabla();
});
document.addEventListener("DOMContentLoaded", actualizarInformacionCarrera);

// Dependiendo cual nivel se seleccione, es la cantidad y número de grados que habrá en la tabla.
function obtenerCuatrimestresDisponibles(turno) {
const nivel = document.getElementById("nivel").value;
let cuatrimestres = [];

if (nivel === "TSU") {
if (turno === "Matutino") {
    cuatrimestres = [1, 2, 3, 4, 5, 6];
} else if (turno === "Nocturno") {
    cuatrimestres = [1, 2, 3, 4, 5, 6, 7, 8];
}
} else if (nivel === "Ing" || nivel === "Lic") {
if (turno === "TSUMAT") {
    cuatrimestres = [7, 8, 9, 10, 11]; // Grados 7 al 11 para TSUMAT
} else if (turno === "TSUNOC") {
    cuatrimestres = [9, 10, 11, 12, 13]; // Grados 9 al 13 para TSUNOC
}
}

return cuatrimestres;
}

// Se añaden las opnciones en lista dependiendo que nivel se seleccione y se divide si es nocturno, matutnino o si vienen de ahí en TSU.
function actualizarTurnoYGrados() {
const nivel = document.getElementById("nivel").value; // Obtener el nivel seleccionado
const turnoSelect = document.getElementById("turno"); // Obtener el selector de turno

// Guardar opciones originales si no están guardadas
if (!window.opcionesTurnoOriginales) {
window.opcionesTurnoOriginales = Array.from(turnoSelect.options).map(opt => {
    return { value: opt.value, text: opt.text };
});
}

// Limpiar las opciones actuales
turnoSelect.innerHTML = '';

// Añadir opción "seleccionar"
const optDefault = document.createElement("option");
optDefault.value = "seleccionar";
optDefault.text = "Selecciona el Turno";
turnoSelect.add(optDefault);

if (nivel === "Ing" || nivel === "Lic") {
// Añadir opciones TSUMAT y TSUNOC para Ingeniería y Licenciatura
const optTSUMAT = document.createElement("option");
optTSUMAT.value = "TSUMAT";
optTSUMAT.text = "TSUMAT";
turnoSelect.add(optTSUMAT);

const optTSUNOC = document.createElement("option");
optTSUNOC.value = "TSUNOC";
optTSUNOC.text = "TSUNOC";
turnoSelect.add(optTSUNOC);

// Seleccionar TSUMAT por defecto
turnoSelect.value = "TSUMAT";
turnoSelect.disabled = false; // Habilitar el selector para elegir entre TSUMAT y TSUNOC
} else {
// Restaurar opciones originales para TSU
window.opcionesTurnoOriginales.forEach(opt => {
    if (opt.value !== "seleccionar") {
        const option = document.createElement("option");
        option.value = opt.value;
        option.text = opt.text;
        turnoSelect.add(option);
    }
});

turnoSelect.disabled = false;
}

actualizarTabla();
actualizarCuatrimestres(); // Actualizar también los cuatrimestres disponibles
}
document.getElementById("nivel").addEventListener("change", actualizarTurnoYGrados);
document.getElementById("turno").addEventListener("change", function() {
actualizarTabla(); // Al cambiar el turno, actualizar la tabla de cuatrimestres
});

// Actualiza los cuatrimestres que se van a modificar, esto dentro del selector en el formulario.
function actualizarCuatrimestres() {
const nivel = document.getElementById("nivel").value;
const turno = document.getElementById("turno").value;
const cuatrimestreSelect = document.getElementById("cuatrimestre");

// Opciones de grados para TSU y Ingeniería
const opciones = {
"TSU": {
    "Matutino": [1, 2, 3, 4, 5],
    "Nocturno": [1, 2, 3, 4, 5, 6, 7]
},
"Ing": {
    "TSUMAT": [7, 8, 9, 10, 11],
    "TSUNOC": [9, 10, 11, 12, 13]
},
"Lic": {
    "TSUMAT": [7, 8, 9, 10, 11],
    "TSUNOC": [9, 10, 11, 12, 13]
}
};

// Limpiar las opciones del select
cuatrimestreSelect.innerHTML = '<option value="seleccionar">Selecciona el Cuatrimestre</option>';

// Verificar el nivel y turno y mostrar las opciones correspondientes
if (nivel && turno && turno !== "seleccionar") {
const grados = opciones[nivel] && opciones[nivel][turno];
if (grados) {
    grados.forEach(function(cuatrimestre) {
        const option = document.createElement("option");
        option.value = cuatrimestre;
        option.textContent = `${cuatrimestre}°`;
        cuatrimestreSelect.appendChild(option);
    });
}
}
}
document.getElementById("nivel").addEventListener("change", actualizarCuatrimestres);
document.getElementById("turno").addEventListener("change", actualizarCuatrimestres);
document.addEventListener("DOMContentLoaded", actualizarCuatrimestres);


// Actualiza toda la tabla, dependiendo si se añade info o se añade algo más.
function actualizarTabla() {
const turno = document.getElementById("turno").value;
const cuatrimestres = obtenerCuatrimestresDisponibles(turno);
const header = document.getElementById("tabla-header");
const tabla = document.getElementById("tabla-body");

const headerRow = header.querySelector("tr");

// Limpiar encabezados excepto la primera columna
while (headerRow.children.length > 1) {
headerRow.removeChild(headerRow.lastChild);
}

// Crear los encabezados de cuatrimestres
cuatrimestres.forEach((cuatrimestre) => {
const celda = document.createElement("th");
celda.innerHTML = `${cuatrimestre}°`;
headerRow.appendChild(celda);
});

// Eliminar celdas "Estadía Profesional" previas en el cuerpo
tabla.querySelectorAll(".celda-estadia").forEach((celda) => celda.remove());

// Insertar la celda de "Estadía Profesional" en el último cuatrimestre
const filas = tabla.querySelectorAll("tr");

filas.forEach((fila, index) => {
const numeroDeColumnas = fila.children.length;

// Solo agregar la celda de estadía en la primera fila si no existe aún
if (index === 0) {
    // Verificar si la celda de estadía ya está agregada
    let celdaEstadia = fila.querySelector(".celda-estadia");

    if (!celdaEstadia) {
        // Colocarla en la última columna (último cuatrimestre)
        const ultimaColumna = cuatrimestres.length - 1;
        celdaEstadia = document.createElement("td");

        // Insertar la celda en la columna correspondiente al último cuatrimestre
        fila.children[ultimaColumna].after(celdaEstadia);

        // Agregar el contenido de la celda de estadía
        celdaEstadia.classList.add("celda-estadia");
        celdaEstadia.innerHTML = "<div>Estadía Profesional</div>";
        celdaEstadia.setAttribute("rowspan", filas.length - 1); // Abarca todas las filas menos la del total
    }
} else {
    // Esconder las celdas de estadía en las demás filas
    const celdaEstadia = fila.querySelector(".celda-estadia");
    if (celdaEstadia) {
        celdaEstadia.style.display = "none";
    }
}

// Ocultar celdas vacías fuera de los cuatrimestres (si se crean por algún motivo)
for (let i = cuatrimestres.length; i < fila.children.length; i++) {
    const celda = fila.children[i];
    // Ocultar celdas vacías que están fuera de los cuatrimestres
    if (!celda.classList.contains("celda-estadia") && !celda.innerHTML.trim()) {
        celda.style.display = "none"; // Ocultar celdas vacías fuera de los cuatrimestres
    }
}
});
}

// Actualiza la celda de estadía profesional, se añade en la ultima columna de la tabla.
function actualizarCeldaEstadia() {
const tabla = document.getElementById("tabla-body");
const filas = tabla.querySelectorAll("tr");

// Verificamos si ya existe la celda de estadía en la primera fila
let estadiaCelda = filas[0].querySelector(".celda-estadia");

// Si no existe, la agregamos
if (!estadiaCelda) {
estadiaCelda = document.createElement("td");
estadiaCelda.classList.add("celda-estadia");
estadiaCelda.innerHTML = "<div>Estadía Profesional</div>";
estadiaCelda.setAttribute("rowspan", filas.length - 1); // Se asegura de abarcar todas las filas menos la del total
filas[0].appendChild(estadiaCelda);
}
}

document.getElementById("btn-agregar-asignatura").addEventListener("click", function () {
const periodo = document.getElementById("periodo").value;
const anio = document.getElementById("anio").value;
const nivel = document.getElementById("nivel").value;
const turno = document.getElementById("turno").value;
const programa_educativo = document.getElementById("programa_educativo").value;
const cuatrimestre = document.getElementById("cuatrimestre").value;
const area_conocimiento = document.getElementById("programa").value;
const asignatura = document.getElementById("asignatura").value;
const horas_total = document.getElementById("horas_total").value;

// Validaciones básicas
if (!periodo) {
alert("Por favor, selecciona un periodo.");
return;
}

if (!anio || !nivel || turno === "seleccionar" || !programa_educativo || 
cuatrimestre === "seleccionar" || !area_conocimiento || !asignatura || !horas_total) {
alert("Por favor, completa todos los campos requeridos.");
return;
}

const datos = {
periodo: periodo,
anio: anio,
nivel: nivel,
turno: turno,
programa_educativo: programa_educativo,
grado: cuatrimestre,
areaConocimiento: area_conocimiento,
asignatura: asignatura,
tHoras: horas_total
};

// Mostrar un indicador de carga o mensaje
console.log("Enviando datos:", datos);

fetch("guardar_asignatura.php", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(datos)
})
.then(response => {
if (!response.ok) {
    throw new Error('Error en la respuesta del servidor: ' + response.status);
}
return response.json();
})
.then(data => {
if (data.success) {
    alert("Asignatura guardada correctamente en la base de datos " + data.nombreBaseDatos);
    // Actualizar la interfaz visual
    agregarFila(); // Esta función ya está definida para actualizar la tabla
    
    // Limpiar campos después de guardar con éxito
    document.getElementById("asignatura").value = "";
    document.getElementById("horas_total").value = "";
    document.getElementById("asignatura").focus();
} else {
    alert("Error: " + data.error);
}
})
.catch(error => {
console.error("Error en la petición:", error);
alert("Ocurrió un error al guardar la asignatura. Consulta la consola para más detalles.");
});
});



function agregarFila() {
const cuatrimestre = parseInt(document.getElementById("cuatrimestre").value);
const asignatura = document.getElementById("asignatura").value;
const horas = parseInt(document.getElementById("horas_total").value);
const programa = document.getElementById("programa").value;

if (!programa || !asignatura || !horas || isNaN(cuatrimestre)) {
alert("Por favor, ingrese todos los datos.");
return;
}

const cuatrimestres = obtenerCuatrimestresDisponibles(document.getElementById("turno").value);
const tabla = document.getElementById("tabla-body");

// Si no existe la tabla o body
if (!tabla) {
console.error("No se encontró la tabla.");
return;
}

let fila = tabla.querySelector(`tr[data-programa='${programa}']`);

// Si no existe una fila para el programa, la creamos
if (!fila) {
fila = document.createElement("tr");
fila.setAttribute("data-programa", programa);

let celdaPrograma = document.createElement("td");
celdaPrograma.textContent = programa;
fila.appendChild(celdaPrograma);

// Añadimos las celdas para cada cuatrimestre
cuatrimestres.forEach(() => {
    fila.appendChild(document.createElement("td"));
});

tabla.appendChild(fila);
}

// Asegurarnos de que cuatrimestre esté dentro del rango
if (cuatrimestre < cuatrimestres[0] || cuatrimestre > cuatrimestres[cuatrimestres.length - 1]) {
alert("Cuatrimestre no válido.");
return;
}

// Encontrar la celda del cuatrimestre en la fila
let celdaAsignatura = fila.children[cuatrimestres.indexOf(cuatrimestre) + 1];  // +1 para evitar la celda del programa

// Si la celda ya tiene contenido, lo añadimos
if (!celdaAsignatura.innerHTML) {
celdaAsignatura.innerHTML = `<div>${asignatura}</div><div>${horas} hrs</div>`;
} else {
celdaAsignatura.innerHTML += `<div>${asignatura}</div><div>${horas} hrs</div>`;
}

// Agregar una línea separadora para diferenciar las asignaturas
celdaAsignatura.innerHTML += `<br>`;

// Actualizamos el total de horas en la fila de totales
agregarTotalHoras(cuatrimestre, horas);

// Realizamos las demás actualizaciones si es necesario
moverTotalHorasAlFinal();
actualizarCeldaEstadia();
actualizarTabla();

}


// Agrega la fila del total de horas y las suma.
function agregarTotalHoras(cuatrimestre, horas) {
const tabla = document.getElementById("tabla-body");
let filaHoras = tabla.querySelector("tr.total-horas");

if (!filaHoras) {
filaHoras = document.createElement("tr");
filaHoras.classList.add("total-horas");

// Configurar la primera celda correctamente
filaHoras.innerHTML = "<td><strong>Total de Horas</strong></td>";

const cuatrimestres = obtenerCuatrimestresDisponibles(document.getElementById("turno").value);

// Añadir celdas para cada cuatrimestre excepto el último
cuatrimestres.forEach((_, index) => {
    if (index !== cuatrimestres.length - 1) {
        let celda = document.createElement("td");
        celda.textContent = "0 hrs"; // Inicializar en 0 horas para cada cuatrimestre excepto el último
        filaHoras.appendChild(celda);
    }
});

// Añadir una celda fija de 525 hrs para el último cuatrimestre
let celdaEstadia = document.createElement("td");
celdaEstadia.textContent = "525 hrs"; // Esta celda es fija
filaHoras.appendChild(celdaEstadia);

tabla.appendChild(filaHoras);
}

const cuatrimestres = obtenerCuatrimestresDisponibles(document.getElementById("turno").value);

if (cuatrimestres.indexOf(cuatrimestre) === -1) {
console.error("Cuatrimestre no válido para este turno.");
return;
}

// Encontrar la celda correcta usando el índice del cuatrimestre
let celdaHoras = filaHoras.children[cuatrimestres.indexOf(cuatrimestre) + 1]; // +1 para evitar la primera celda (que es el total)

// Si no es el último cuatrimestre, se suman las horas normalmente
const esUltimoCuatrimestre = cuatrimestres.indexOf(cuatrimestre) === cuatrimestres.length - 1;

if (!esUltimoCuatrimestre) {
let horasActuales = parseInt(celdaHoras.textContent) || 0;
celdaHoras.innerHTML = `<strong>${horasActuales + horas} hrs</strong>`;
}
}

// En esta funcion la fila la coloca hasta el final, que es el total de horas sumadas de la columna.
function moverTotalHorasAlFinal() {
const tabla = document.getElementById("tabla-body");
const filaTotalHoras = tabla.querySelector("tr.total-horas");

if (filaTotalHoras) {
// Asegurarse de mover la fila al final de la tabla, justo después de las demás filas
tabla.appendChild(filaTotalHoras);
}
}

// Actualiza la parte inferior de la tabla, que es el footer.
function actualizarFooter() {
const anio = document.getElementById("anio").value;

// Verificar si el año tiene exactamente 4 dígitos
if (anio && anio.length === 4 && !isNaN(anio)) {
// Actualizar el año en el footer
const anioFooter = document.getElementById("anio-footer");
if (anioFooter) anioFooter.textContent = anio;
} else if (anio.length > 4) {
// Si el año tiene más de 4 dígitos, recortar a los primeros 4 dígitos
document.getElementById("anio").value = anio.substring(0, 4);
const anioFooter = document.getElementById("anio-footer");
if (anioFooter) anioFooter.textContent = document.getElementById("anio").value;
} else {
// Si no hay valor o el año es inválido, mostrar mensaje predeterminado
const anioFooter = document.getElementById("anio-footer");
if (anioFooter) anioFooter.textContent = "Año no especificado";
}
}

// Evento para actualizar el pie de página cuando cambie el año
document.getElementById("anio").addEventListener("input", actualizarFooter);








// Declarar la variable global al principio del archivo o script
let savedTemplates = {};  // Este objeto almacenará las plantillas guardadas

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("nueva-tab").addEventListener("click", crearNuevaPestania);
    document.getElementById("periodo").addEventListener("change", function () {
        cargarPlantillasDesdeBD(this.value);
    });
});

// ✅ Función para crear una nueva pestaña visualmente
function crearNuevaPestania() {
    const nuevoTabId = `pestania-${document.querySelectorAll(".tab-plantilla").length}`;
    crearElementoPestania(nuevoTabId);
    crearContenidoPestania(nuevoTabId);
    cambiarAPestania(nuevoTabId);
}

// ✅ Crear la pestaña en la interfaz
function crearElementoPestania(tabId) {
    const listaTabs = document.getElementById("tabs-plantillas");
    if (!listaTabs) return;

    const nuevaTab = document.createElement("div");
    nuevaTab.className = "tab-plantilla";
    nuevaTab.setAttribute("data-tab-id", tabId);
    nuevaTab.innerHTML = `Plan de Estudios ${tabId.replace("pestania-", "")} <span class="cerrar-tab">&times;</span>`;

    nuevaTab.addEventListener("click", () => cambiarAPestania(tabId));
    nuevaTab.querySelector(".cerrar-tab").addEventListener("click", (e) => {
        e.stopPropagation();
        cerrarPestania(tabId);
    });

    listaTabs.insertBefore(nuevaTab, document.getElementById("nueva-tab"));
}

// ✅ Crear el contenido de la pestaña
function crearContenidoPestania(tabId) {
    const contenedorContenido = document.getElementById("contenido-plantillas");
    if (!contenedorContenido) return;

    const nuevaPestaniaContenido = document.createElement("div");
    nuevaPestaniaContenido.id = tabId;
    nuevaPestaniaContenido.className = "contenido-tab";
    nuevaPestaniaContenido.innerHTML = `<p>Plan de estudios guardado.</p>`;
    contenedorContenido.appendChild(nuevaPestaniaContenido);
}

function cambiarAPestania(tabId) {
    document.querySelectorAll(".tab-plantilla").forEach(tab => tab.classList.remove("activa"));
    document.querySelectorAll(".contenido-tab").forEach(content => content.classList.remove("activo"));

    const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
    const contentElement = document.getElementById(tabId);

    if (tabElement && contentElement) {
        tabElement.classList.add("activa");
        contentElement.classList.add("activo");
    }
}

// ✅ Cerrar pestaña sin afectar otras plantillas
function cerrarPestania(tabId) {
    document.querySelector(`[data-tab-id="${tabId}"]`)?.remove();
    document.getElementById(tabId)?.remove();
}

// ✅ Guardar el Plan de Estudios como imagen
async function guardarPlanDeEstudiosComoImagen() {
    try {
        const periodoSelect = document.getElementById("periodo");
        const periodo = periodoSelect.value;

        if (!periodo) {
            alert("Por favor, seleccione un período antes de guardar el plan de estudios.");
            periodoSelect.focus();
            return;
        }

        const contenidoTabla = document.querySelector(".col-md-8");
        if (!contenidoTabla) {
            alert("Error: No se encontró la tabla para guardar.");
            return;
        }

        // Usamos html2canvas para capturar la tabla como imagen
        const canvas = await html2canvas(contenidoTabla, {
            allowTaint: true,
            useCORS: true,
            scale: 2,
            backgroundColor: "#ffffff"
        });

        if (!canvas) {
            throw new Error("No se pudo generar la imagen.");
        }

        const imagenBase64 = canvas.toDataURL("image/png");

        // Preparamos los datos a enviar
        const data = { periodo: periodo, plantillaPE: imagenBase64 };

        console.log("Datos a enviar:", {
            periodo: data.periodo,
            longitudImagen: data.plantillaPE.length
        });

        // Enviamos los datos al servidor
        const response = await fetch("guardar_plantilla_pe.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(data)
        });

        // Usamos response.json() para obtener la respuesta como objeto JavaScript
        const result = await response.json(); // Cambié esto de .text() a .json()

        console.log("Respuesta del servidor:", result);

        // Si la respuesta es exitosa, mostrar un mensaje y agregar la nueva pestaña
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Plan de Estudios Guardado',
                text: result.message || 'El plan de estudios se guardó correctamente',
                timer: 2000,
                timerProgressBar: true
            });

            // ✅ Agregar la nueva pestaña directamente en lugar de recargar todas
            const nuevoTabId = `pestania-${document.querySelectorAll(".tab-plantilla").length}`;
            crearElementoPestania(nuevoTabId);
            crearContenidoPestania(nuevoTabId);
            actualizarContenidoPestania(nuevoTabId, imagenBase64);
            cambiarAPestania(nuevoTabId);

            // Guardar la plantilla en la variable global
            savedTemplates[nuevoTabId] = imagenBase64;  // Ahora esta variable está definida

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al Guardar',
                text: result.error || 'No se pudo guardar el plan de estudios',
                footer: `Detalles completos: ${JSON.stringify(result)}`
            });

            console.error("Error del servidor:", result.error);
        }

    } catch (error) {
        console.error("Error completo al guardar el plan de estudios:", error);

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Error al guardar el plan de estudios: ${error.message}`,
            footer: 'Verifique la consola para más detalles'
        });
    }
}

// Ejemplo de cómo podría ser la definición de la función cargarPlantillasDesdeBD
async function cargarPlantillasDesdeBD(periodo) {
    try {
        const response = await fetch(`obtener_plantillas_pe.php?periodo=${periodo}`);
        const result = await response.json();

        if (result.success && result.plantillas.length > 0) {
            result.plantillas.forEach(plantilla => {
                const nuevoTabId = `pestania-${document.querySelectorAll(".tab-plantilla").length}`;
                crearNuevaPestania();
                actualizarContenidoPestania(nuevoTabId, plantilla.plantillaPE);
            });
        } else {
            alert("No hay planes de estudios guardados para este período.");
        }
    } catch (error) {
        console.error("Error al obtener los planes de estudios:", error);
        alert("Error al obtener los planes de estudios.");
    }
}


// ✅ Actualizar contenido de pestaña con imagen
function actualizarContenidoPestania(tabId, imagenData) {
    const contenidoPestania = document.getElementById(tabId);
    if (!contenidoPestania) return;

    contenidoPestania.innerHTML = "";
    const imagen = document.createElement("img");
    imagen.src = imagenData;
    imagen.style.width = "100%";
    contenidoPestania.appendChild(imagen);
}









// Función para exportar plantillas
async function exportTemplates(exportMode = 'all') {
    try {
        // Verificar que jsPDF está disponible
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
            alert("La librería jsPDF no está cargada. Por favor, añada el script a su HTML.");
            return;
        }

        // Obtener el período actual seleccionado
        const periodoSelect = document.getElementById("periodo");
        const periodo = periodoSelect.value;

        if (!periodo) {
            alert("Por favor, seleccione un período antes de exportar.");
            return;
        }

        // Obtener las plantillas desde la base de datos
        const response = await fetch(`obtener_plantillas_pe.php?periodo=${periodo}`);
        const result = await response.json();

        if (!result.success || result.plantillas.length === 0) {
            alert("No hay plantillas guardadas para este período.");
            return;
        }

        // Si el modo es 'selected', mostrar el diálogo de selección
        if (exportMode === 'selected') {
            showTemplateSelectionDialog(result.plantillas);
        } else {
            // Exportar todas las plantillas directamente
            generatePDF(result.plantillas);
        }
    } catch (error) {
        console.error("Error al exportar plantillas:", error);
        alert("Error al exportar plantillas: " + error.message);
    }
}

function generatePDF(plantillas) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = 297;
    const pageHeight = 210;

    // Reduced margins to maximize content area
    const marginTop = 5;
    const marginLeft = 5;
    const marginRight = 5;
    const marginBottom = 10;

    const contentWidth = pageWidth - (marginLeft + marginRight);

    doc.setFontSize(6); // Reduced font size

    let currentPage = 1;

    plantillas.forEach((plantilla, index) => {
        if (index > 0) {
            doc.addPage();
            currentPage++;
        }

        try {
            // Usar directamente la imagen base64 de la plantilla
            const imgData = plantilla.plantillaPE;
            if (imgData) {
                const tempImg = new Image();
                tempImg.src = imgData;

                const aspectRatio = tempImg.height / tempImg.width;
                const imgWidth = contentWidth * 0.95; // Slightly reduced width
                const imgHeight = imgWidth * aspectRatio;

                // Center the image with reduced margins
                const xPosition = (pageWidth - imgWidth) / 2;
                
                doc.addImage(imgData, 'PNG', xPosition, marginTop, imgWidth, imgHeight, undefined, 'MEDIUM');
            }
        } catch (error) {
            doc.text(`Error al cargar la imagen de la plantilla ${index + 1}`, marginLeft, marginTop + 20);
        }

        // Smaller footer text
        doc.setFontSize(5);
        doc.text("© Universidad Tecnológica Cadereyta", marginLeft, pageHeight - marginBottom - 2);
        doc.text(`Página ${currentPage} de ${plantillas.length}`, pageWidth - marginRight - 40, pageHeight - marginBottom - 2);
    });

    doc.save('plantillas_planes_estudio.pdf');
    alert(`PDF generado con éxito con ${plantillas.length} plantilla(s) en formato horizontal.`);
}
// Función para mostrar diálogo de selección de plantillas
function showTemplateSelectionDialog(plantillas) {
    // Crear el contenedor del diálogo
    const dialogOverlay = document.createElement("div");
    dialogOverlay.className = "dialog-overlay";
    dialogOverlay.style.position = "fixed";
    dialogOverlay.style.top = "0";
    dialogOverlay.style.left = "0";
    dialogOverlay.style.width = "100%";
    dialogOverlay.style.height = "100%";
    dialogOverlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    dialogOverlay.style.display = "flex";
    dialogOverlay.style.justifyContent = "center";
    dialogOverlay.style.alignItems = "center";
    dialogOverlay.style.zIndex = "1000";

    // Crear el diálogo
    const dialog = document.createElement("div");
    dialog.className = "template-selection-dialog";
    dialog.style.width = "80%";
    dialog.style.maxWidth = "600px";
    dialog.style.backgroundColor = "#fff";
    dialog.style.padding = "20px";
    dialog.style.borderRadius = "5px";
    dialog.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";

    // Título del diálogo
    const title = document.createElement("h3");
    title.textContent = "Seleccionar plantillas para exportar";
    title.style.marginTop = "0";
    dialog.appendChild(title);

    // Lista de plantillas con checkboxes
    const templatesList = document.createElement("div");
    templatesList.style.maxHeight = "300px";
    templatesList.style.overflowY = "auto";
    templatesList.style.marginBottom = "15px";

    // Añadir checkbox "Seleccionar todas"
    const selectAllContainer = document.createElement("div");
    selectAllContainer.style.marginBottom = "10px";
    selectAllContainer.style.padding = "8px";
    selectAllContainer.style.backgroundColor = "#f5f5f5";
    selectAllContainer.style.borderRadius = "4px";

    const selectAllCheck = document.createElement("input");
    selectAllCheck.type = "checkbox";
    selectAllCheck.id = "select-all-templates";
    selectAllCheck.style.marginRight = "10px";

    const selectAllLabel = document.createElement("label");
    selectAllLabel.htmlFor = "select-all-templates";
    selectAllLabel.textContent = "Seleccionar todas";
    selectAllLabel.style.fontWeight = "bold";

    selectAllContainer.appendChild(selectAllCheck);
    selectAllContainer.appendChild(selectAllLabel);
    templatesList.appendChild(selectAllContainer);

    // Crear checkboxes para cada plantilla
    const checkboxes = [];
    plantillas.forEach((plantilla, index) => {
        const checkContainer = document.createElement("div");
        checkContainer.style.margin = "5px 0";
        checkContainer.style.padding = "8px";
        checkContainer.style.borderBottom = "1px solid #eee";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `select-plantilla-${index}`;
        checkbox.value = index;
        checkbox.style.marginRight = "10px";
        checkboxes.push(checkbox);

        const label = document.createElement("label");
        label.htmlFor = `select-plantilla-${index}`;
        label.textContent = `Plantilla ${index + 1}`;

        checkContainer.appendChild(checkbox);
        checkContainer.appendChild(label);
        templatesList.appendChild(checkContainer);
    });

    // Configurar el evento del checkbox "Seleccionar todas"
    selectAllCheck.addEventListener("change", function() {
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheck.checked;
        });
    });

    dialog.appendChild(templatesList);

    // Botones de acción
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.justifyContent = "flex-end";
    buttonsContainer.style.gap = "10px";

    const cancelButton = document.createElement("button");
    cancelButton.className = "btn btn-secondary";
    cancelButton.textContent = "Cancelar";
    cancelButton.addEventListener("click", function() {
        document.body.removeChild(dialogOverlay);
    });

    const exportButton = document.createElement("button");
    exportButton.className = "btn btn-primary";
    exportButton.textContent = "Exportar seleccionadas";
    exportButton.addEventListener("click", function() {
        const selectedPlantillas = checkboxes
            .filter(checkbox => checkbox.checked)
            .map(checkbox => plantillas[checkbox.value]);

        if (selectedPlantillas.length === 0) {
            alert("Por favor seleccione al menos una plantilla.");
            return;
        }

        document.body.removeChild(dialogOverlay);
        generatePDF(selectedPlantillas);
    });

    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(exportButton);
    dialog.appendChild(buttonsContainer);

    // Añadir el diálogo al body
    dialogOverlay.appendChild(dialog);
    document.body.appendChild(dialogOverlay);
}

// Añadir los botones de exportación al DOM
document.addEventListener("DOMContentLoaded", function() {
    const formContainer = document.querySelector(".form-container");
    if (formContainer) {
        // Contenedor para los botones de exportación
        const exportContainer = document.createElement("div");
        exportContainer.className = "export-buttons";
        exportContainer.style.marginTop = "10px";
        exportContainer.style.display = "flex";
        exportContainer.style.gap = "10px";

        // Botón para exportar todas
        const exportAllButton = document.createElement("button");
        exportAllButton.className = "btn btn-info";
        exportAllButton.textContent = "Exportar Todas";
        exportAllButton.addEventListener("click", function() {
            exportTemplates('all');
        });
        exportContainer.appendChild(exportAllButton);

        // Botón para exportar seleccionadas
        const exportSelectedButton = document.createElement("button");
        exportSelectedButton.className = "btn btn-primary";
        exportSelectedButton.textContent = "Exportar Seleccionadas";
        exportSelectedButton.addEventListener("click", function() {
            exportTemplates('selected');
        });
        exportContainer.appendChild(exportSelectedButton);

        formContainer.appendChild(exportContainer);
    }
});


function reiniciarPagina() {
// Recargar la página sin perder el estado de las plantillas
saveTemplatesToStorage();  // Asegúrate de guardar las plantillas antes de recargar
location.reload();  // Recarga la página actual sin interacción manual
}

























function imprimirPagina() {
    console.log("Print function called");
    
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    
    // Add the iframe to the document
    document.body.appendChild(iframe);
    
    // Wait for the iframe to load
    iframe.onload = function() {
        try {
            // Get the content to print
            const content = document.querySelector('.col-md-8').cloneNode(true);
            
            // Write the content to the iframe
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Imprimir Plan de Estudios</title>
                    <style>
                        /* Estilo para la impresión */
@media print {
    @page {
        size: A4 landscape; /* Tamaño de la página en formato horizontal */
        margin: 10mm; /* Margen igual en todos los lados */
    }

    body {
        margin: 0;
        padding: 0;
        visibility: hidden;
    }

    /* Contenedor principal visible durante la impresión */
    .col-md-8 {
        visibility: visible;
        position: absolute;
        top: 0; /* Reducimos el margen superior */
        left: 50%; /* Centrado horizontal */
        transform: translateX(-50%); /* Ajuste para centrar horizontalmente */
        width: 100%;
        height: auto;
        margin: 0;
        padding: 10px; /* Añadimos un poco de padding interno */
    }

    .col-md-8 * {
        visibility: visible;
    }

    /* Ocultar elementos no requeridos en la impresión */
    .col-md-4, .btn-primary {
        display: none !important;
    }

    #informacion-carrera {
        display: flex;                       /* Usa flexbox */
        flex-direction: column;              /* Organiza los elementos en columna */
        justify-content: center;             /* Centra los elementos verticalmente */
        align-items: center;                 /* Centra los elementos horizontalmente */
        text-align: center;                  /* Centra el texto dentro de los elementos */
        padding: 20px;                       /* Añadir espacio alrededor */
        padding-left: 100px;                  /* Añadir margen izquierdo */
        padding-right: 100px;                 /* Añadir margen derecho */
        margin-top: -100px;
    }

    #informacion-carrera p {
        margin: 5px 0;                       /* Añadir margen entre los párrafos */
        font-size: 18px;                     /* Ajusta el tamaño del texto si es necesario */
        color: #000000;                      /* Color negro */
    }

    /* Ajuste del contenedor de la tabla */
    .table-container {
        width: 100%;  /* El contenedor puede tomar todo el ancho disponible */
        padding: 0;
        margin: 0 auto;  /* Centra el contenedor horizontalmente */
        clear: both; /* Asegura que la tabla aparezca debajo de la información de carrera */
        text-align: center; /* Centra el contenido dentro del contenedor */
        margin-top: 2px; /* Añadimos un margen superior para separar la tabla del resto */
    }

    /* Estilos para la tabla */
    table {
        width: 90%;  /* La tabla toma el 90% del ancho del contenedor */
        margin: 0 auto;  /* Centra la tabla dentro del contenedor */
        border-collapse: collapse;
        table-layout: fixed;
        font-size: 9px;
        margin-top: 2px; /* Añadimos un pequeño margen superior */
    }

    th, td {
        border: 1px solid #ddd;
        padding: 4px;
        font-size: 9px;
        text-align: center;
    }

    th {
        background-color: #008f39 !important;
        color: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .total-horas {
        font-weight: bold;
        background-color: #f4f4f4 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .col-md-8, .table-container, table, th, td {
        page-break-inside: avoid;
    }

    /* Mejoras en el footer para impresión */
    #footer {
        font-size: 7px;
        width: 98%;
        margin-top: 30px; /* Añadimos un margen superior para mover el footer abajo */
        padding: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    #footer div {
        width: auto;
    }

    .footer p {
        font-size: 7px;

        text-align: left;
        margin-left: 50px;
    }

    /* Añadir espacio entre el texto "PLAN DE ESTUDIOS VIGENTE EN SEPTIEMBRE" y el año */
    #anio-footer {
        margin-left: 5px;                   /* Añadir espacio entre el texto y el año */
    }

    /* Alineación de elementos del footer */
    #footer div:last-child {
        text-align: right;
        
    }

    /* Establecer el tamaño de la fuente fuera de la tabla */
    body * {
        font-size: 9px !important;
    }

    /* Excepciones para el tamaño de fuente */
    #informacion-carrera * {
        font-size: 12px !important;
    }

    /* Estilo para el encabezado h1 */
    h1 {
        text-align: center;                /* Centra el texto del h1 */
        font-size: 36px;                   /* Tamaño adecuado para el título */
        font-weight: bold;                 /* Texto en negrita */
        color: #008f39;                    /* Color verde */
        margin-top: 0;                     /* Elimina margen superior */
    }

    table, th, td {
        font-size: 9px !important;
    }

    .image123 img {
        display: block;
        width: 140px; /* Reducimos un poco el tamaño */
        height: 70px;
        object-fit: contain;
        margin-top: 20px; /* Reducimos el espaciado superior */
        margin-bottom: 10px; /* Reducimos el margen debajo de la imagen */
        margin-left: 35px;
    }
}

                    </style>
                </head>
                <body>
                    ${content.outerHTML}
                </body>
                </html>
            `);
            doc.close();
            
            // Print the iframe content
            console.log("Printing iframe content");
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // Remove the iframe after printing
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 2000);
        } catch (error) {
            console.error("Error with iframe printing:", error);
            document.body.removeChild(iframe);
        }
    };
    
    // Set a source for the iframe
    iframe.src = 'about:blank';
}