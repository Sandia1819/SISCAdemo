

function agregarPeriodo() {
    // Obtener valores del formulario
    const año = document.getElementById("año").value;
    const periodo = document.getElementById("periodo").value;

    if (!año || !periodo || año.length !== 4) {
        alert("Por favor, complete ambos campos con un año válido.");
        return;
    }

    // Crear string del periodo
    const nuevoPeriodo = `${periodo} ${año}`;
    
    // Modificar esta línea: incluir el año en el nombre de la base de datos
    const nombreBaseDatos = `periodo_${periodo.toLowerCase().replace(/ /g, '_')}_${año}`;

    // Formatear el nombre visual del periodo (en formato "Mes - Mes Año")
    const nombreFormateado = formatearNombrePeriodo(nombreBaseDatos);

    // Resto del código igual...
    fetch('crear_periodo.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ periodo: nuevoPeriodo, año: año })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Periodo agregado y base de datos creada con éxito.");
            // Limpiar los campos
            document.getElementById("año").value = "";

            // Agregar el nuevo periodo visualmente, con el formato deseado
            agregarBotonPeriodo(nombreFormateado, nombreBaseDatos);

        } else {
            alert("Error al crear el periodo o la base de datos.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un problema con la solicitud.');
    });
}


document.addEventListener("DOMContentLoaded", function() {
    obtenerPeriodosDesdeBaseDeDatos();
});


function agregarBotonPeriodo(periodo, nombreBaseDatos) {
    const contenedor = document.getElementById("periodos-container");

    const div = document.createElement("div");
    div.className = "btn";
    div.textContent = periodo;  // Mostramos el nombre formateado del periodo

    div.setAttribute('data-nombreBaseDatos', nombreBaseDatos);  // Guardamos el nombre de la base de datos

    contenedor.appendChild(div);

    div.addEventListener('click', function() {
        eliminarPeriodo(div);
    });
}

function eliminarPeriodo(boton) {
    const nombreBaseDatos = boton.getAttribute('data-nombreBaseDatos');

    const confirmar = confirm("¿Desea eliminar este periodo de la base de datos?");

    if (confirmar) {
        fetch('eliminar_periodo.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombreBaseDatos: nombreBaseDatos })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                boton.remove();  // Eliminar el botón visualmente
                alert("Periodo eliminado correctamente.");
            } else {
                alert("Hubo un problema al eliminar el periodo.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema con la solicitud.');
        });
    }
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

// Modificar la función obtenerPeriodosDesdeBaseDeDatos
function obtenerPeriodosDesdeBaseDeDatos() {
    fetch('obtener_periodos.php')
        .then(response => response.json())
        .then(periodos => {
            if (periodos.length > 0) {
                periodos.forEach(periodo => {
                    // Asegurarse de que el nombre de la base de datos incluya el año
                    // Esto asume que tu API devuelve tanto el nombre de la base de datos como el año
                    // Si no es así, deberías modificar tu API para que incluya esta información
                    const nombreFormateado = formatearNombrePeriodo(periodo);
                    agregarBotonPeriodo(nombreFormateado, periodo);
                });
            }
        })
        .catch(error => {
            console.error('Error al obtener los periodos:', error);
        });
}
