document.addEventListener("DOMContentLoaded", () => {
    // Elimina el primer ícono de tres líneas horizontales si está presente
    const sidebar = document.querySelector(".sidebar ul");
    if (sidebar) {
        const firstItem = sidebar.firstElementChild;
        if (firstItem) {
            sidebar.removeChild(firstItem);
        }
    }
});
