 // Obtiene la fecha actual
const fechaActual = new Date();

// Define las opciones para obtener el día, mes y año
const opcionesFecha = { day: '2-digit', month: 'long', year: 'numeric' };

// Formatea la fecha con el mes en letras (minúsculas) y separado por guiones
let fechaFormateada = fechaActual.toLocaleDateString('es-MX', opcionesFecha);

// Convierte el mes a minúsculas y organiza la fecha en el formato 'dd-mes-año'
fechaFormateada = fechaFormateada
    .replace(/\sde\s/g, '-')        // Elimina " de " y reemplaza por guiones
    .replace(/ /g, '-')            // Reemplaza los espacios por guiones
    .toLowerCase();               // Convierte todo a minúsculas

// Define la ubicación
const ubicacion = "Cadereyta Jiménez, N.L.";

// Inserta la ubicación y la fecha en el div
document.querySelector('.ubicacion').innerHTML = `${ubicacion}, <span class="fecha">${fechaFormateada}</span>`;
