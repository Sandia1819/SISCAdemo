let currentRole = null;
let currentProfile = null;

const profilesData = {
    admin: {
        SUBDIRECTOR_ACADÉMICO: "SUBDIRECTOR",
        PTC_CARGA_ACADÉMICA: "CARGAACADEMICA",
    },
    coordinación: {
        MATUTINO: "guest123",
        NOCTURNO: "guest234",
    },
    ptc_proyecto_integrador: {
        MATUTINO: "guest123",
        NOCTURNO: "guest234",
    },
    tutoría: {
        LIC_IRMA: "guest123",
    },
    prefectura: {
        LIC_ARTURO: "guest123",
    },
    docente: {
        PROYECTO_INTEGRADOR: "guest123",
    }
};

// Abrir el formulario modal
function openLoginForm(role) {
    currentRole = role;
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("loginModalOverlay").style.display = "block";
    document.getElementById("formTitle").textContent =
        role === "admin" ? "Administrador" :
        role === "coordinación" ? "Coordinación" :
        role === "ptc_proyecto_integrador" ? "Proyecto Integrador" :
        role === "tutoría" ? "Tutoría" :
        role === "prefectura" ? "Prefectura" :
        role === "docente" ? "Docente" : "";
    resetForm(); // Restablecer el formulario
    showProfiles(); // Mostrar los perfiles disponibles
}

// Cerrar el formulario modal
function closeLoginForm() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("loginModalOverlay").style.display = "none";
    resetForm(); // Restablecer el formulario
}

// Restablecer el formulario
function resetForm() {
    document.getElementById("password").value = "";
    document.getElementById("username").value = "";
    document.getElementById("profilesContainer").style.display = "none";
    document.getElementById("credentialsContainer").style.display = "none";
    currentProfile = null;
}

// Mostrar perfiles disponibles
function showProfiles() {
    const profilesContainer = document.getElementById("profilesContainer");
    const profilesList = document.getElementById("profilesList");

    profilesList.innerHTML = ""; // Limpiar la lista de perfiles

    const profiles = profilesData[currentRole] ? Object.keys(profilesData[currentRole]) : [];

    profiles.forEach(profile => {
        const button = document.createElement("button");
        button.className = "profile-button";
        button.textContent = profile;
        button.onclick = () => showCredentials(profile);
        profilesList.appendChild(button);
    });

    profilesContainer.style.display = "block"; // Mostrar el contenedor de perfiles
}

// Mostrar credenciales del perfil seleccionado
function showCredentials(profile) {
    currentProfile = profile;

    document.getElementById("profilesContainer").style.display = "none";
    document.getElementById("credentialsContainer").style.display = "block";

    document.getElementById("username").value = profile;
    document.getElementById("password").value = ""; // Borrar la contraseña anterior
}

// Función para mostrar las notificaciones
function showNotification(type, message) {
    const notificationContainer = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    // Mostrar la notificación y ocultarla después de 5 segundos
    notification.style.display = 'block';
    setTimeout(function() {
        notification.style.display = 'none';
        notification.remove(); // Eliminar la notificación después de ocultarla
    }, 5000);
}

// Función para verificar la contraseña e iniciar sesión
function checkPassword() {
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    // Limpiar notificaciones previas
    const notificationContainer = document.getElementById('notificationContainer');
    notificationContainer.innerHTML = '';

    // Validar si los campos están vacíos
    if (!usernameInput || !passwordInput) {
        showNotification('info', 'Por favor, complete todos los campos.');
        return;
    }

    // Validar si la contraseña es demasiado débil
    if (passwordInput.length < 6) {
        showNotification('warning', 'Contraseña débil, debe tener al menos 6 caracteres.');
        return;
    }

    // Verificar si se seleccionó un perfil
    if (!currentProfile) {
        showNotification('info', 'Por favor, seleccione un perfil.');
        return;
    }

    // Verificar si la contraseña es correcta para el perfil seleccionado
    if (passwordInput === profilesData[currentRole][currentProfile]) {
        // Redirigir según el rol
        switch (currentRole) {
            case "admin":
                window.location.href = "/siscaadministrador/indexadm.html";
                break;
            case "coordinación":
                window.location.href = "/siscacoordinacion/indexcoord.html";
                break;
            case "ptc_proyecto_integrador":
                window.location.href = "/siscaptc_proyecto_integrador/indexptcpi.html";
                break;
            case "tutoría":
                window.location.href = "/siscatutoria/indextuto.html";
                break;
            case "prefectura":
                window.location.href = "/siscaprefectura/indexpref.html";
                break;
            case "docente":
                window.location.href = "/siscadocente/indexdocente.html";
                break;
            default:
                showNotification('error', 'Rol no reconocido.');
                return;
        }
    } else {
        // Si la contraseña es incorrecta, mostrar un mensaje de error
        showNotification('error', 'Acceso denegado. Usuario o contraseña incorrectos.');
    }
}

// Escuchar cuando se presione la tecla Enter en el input de la contraseña
document.getElementById('password').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        // Si la tecla presionada es Enter, llamar a la función checkPassword
        checkPassword();
    }
});
