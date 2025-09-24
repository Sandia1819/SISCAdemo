// Asegurar que los placeholders sean visibles al imprimir
window.addEventListener('beforeprint', () => {
    const inputs = document.querySelectorAll('.campo-fecha');
    inputs.forEach(input => {
        if (!input.value) { // Si el campo está vacío
            input.setAttribute('data-placeholder', input.placeholder); // Guarda el placeholder original
            input.value = input.placeholder; // Copia el placeholder en el campo
        }
    });
});

// Restaurar los campos después de imprimir
window.addEventListener('afterprint', () => {
    const inputs = document.querySelectorAll('.campo-fecha');
    inputs.forEach(input => {
        if (input.getAttribute('data-placeholder')) {
            input.value = ''; // Limpia el valor después de imprimir
        }
    });
});


