// Selecciona todos los inputs en las tablas
const inputs = document.querySelectorAll('td input');

inputs.forEach(input => {
    // Ajusta el ancho inicial según el contenido
    input.style.width = `${input.value.length + 1}ch`;

    // Agrega un evento para ajustar el ancho dinámicamente al escribir
    input.addEventListener('input', function () {
        this.style.width = `${this.value.length + 1}ch`;
    });
});
