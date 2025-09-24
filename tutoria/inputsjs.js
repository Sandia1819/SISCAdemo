document.querySelectorAll('.fmt input').forEach(input => {
    // Al hacer foco, si el campo está vacío, poner el valor del placeholder
    input.addEventListener('focus', function() {
        if (this.value === '') {
            this.value = this.placeholder;
        }
    });

    // Al perder el foco, si el valor es igual al placeholder, dejarlo vacío
    input.addEventListener('blur', function() {
        if (this.value === this.placeholder) {
            this.value = '';
        }
    });
});


document.getElementById("selectDocente").addEventListener("change", function() {
    var selectedDocente = this.options[this.selectedIndex].text;
    document.getElementById("docenteNombre").textContent = selectedDocente;
});