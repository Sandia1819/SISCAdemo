//^ Variable global del nombre de la página actual.
var pageName = "home";

$(document).ready(function () {

    //* Cambiar tamaño de la barra lateral y la página principal.
    $(document).on("click", ".sidebar-toggle", function () {
        ToggleSidebar($("#sidebar"), $("#navbar"));
    });

    //* Cambiar la página al presionar un botón de link.
    $(document).on("click", ".btn-page", function () {
        LoadPage($(this).data("page"));
    });

    //* Reiniciar los datos del formulario actual.
    $(document).on("click", ".btn-reset", function () {
        ResetForm($(this).data("form"));
    });

    //* Rellenar el formulario de edición con los datos del registro.
    $(document).on("click", ".btn-modal-edit", function () {
        FillEditForm($(this).data("info"));
    });

    //* Registrar los datos del formulario actual.
    $(document).on("click", ".btn-registro", function () {
        SubmitForm($(this).data("form"));
    });

    //* Editar los datos del registro seleccionado.
    $(document).on("click", ".btn-edicion", function () {
        EditForm($(this).data("form"));
    });

    //* Borrar el registro seleccionado.
    $(document).on("click", ".btn-borrar", function () {
        DeleteItem($(this).data("id"));
    });

    //* Cambiar el estado del registro.
    $(document).on("click", ".btn-estado", function () {
        SwitchItemState($(this).data("id"));
    });

    //* Filtrar los registros del selector determinado.
    $(document).on("keyup", ".input-filter", function () {
        FilterItems($(this).val().toLowerCase() ,$(this).data("filter"));
    });

    //* Obtener las siglas de un texto.
    $(document).on("keyup", ".input-setAbbr", function () {
        $($(this).data("target")).val(GetAcronym($(this).val()));
    });

    //* Obtener la abreviación de un Plan de Estudios.
    $(document).on("change", ".input-getAbbr", function () {
        GetAbbreviation($(this).val(), $(this).data("target"));
    });

    //* Obtener la abreviación de un Programa Educativo.
    $(document).on("change", ".form-abbr .input-changeAbbr", function () {
        GetFullAbbreviation($(this).parents(".form-abbr"));
    });

});

//& Función para cambiar el tamaño de la barra lateral.
function ToggleSidebar(sidebar, navbar) {

    sidebar.toggleClass("retract expand");
    navbar.toggleClass("full partial");

}

//& Función para cambiar la página principal.
function LoadPage(page) {

    $("#main-page").load("pages/" + page + ".php");
    pageName = page;

}

//& Función para crear un DataTable.
function CreateDataTable(table) {

    if ($.fn.DataTable.isDataTable($(table))) {
        $(table).DataTable().destroy();
    }

    $(".dataTables_filter").remove();

    new DataTable((table), {

        language: {
            "decimal": ".",
            "thousands": ",",
            "lengthMenu": "Mostrar _MENU_ registros",
            "zeroRecords": "<h5 class='text-center text-muted'> No se encontraron resultados </h5>",
            "sSearch": "Buscar:",
            "info": "Página _PAGE_ de _PAGES_",
            "infoEmpty": "No hay registros disponibles",
            "infoFiltered": "(filtrado de _MAX_ registros)",
            "oPaginate": {
                "sFirst": "l<<",
                "sLast":">>l",
                "sNext":">",
                "sPrevious": "<"
            },
            "sProcessing":"Cargando..."
        },

        drawCallback: function() {
            $('.dataTables_paginate').addClass('btn-group btn-group-lg btn-group-justified');
            $('.dataTables_paginate a').addClass('btn btn-link');
        },

        pagingType: "full",
        pageLength: 6,
        lengthChange: false,
        ordering: false

    });

    $("#tabla-" + pageName + "_info").addClass("small");

    let tableFilter = $("#tabla-" + pageName + "_filter").addClass("col-sm-6 input-group pull-right");
    let filterLabel = tableFilter.children().addClass("input-group-addon");
    filterLabel.children().addClass("form-control").insertAfter(filterLabel).attr("placeholder", "Buscar...");
    filterLabel.html("<span class='glyphicon glyphicon-search'></span>");
    $(".list-group-item.container-fluid").append(tableFilter);

    $("form").each(function () {
        $(this)[0].addEventListener("submit", function (e) {
            e.preventDefault();
        });
    });

}

//& Función para recargar un DataTable.
function ReloadDataTable(name){

    LoadPage(name);
    $("body").removeClass("modal-open");
    $(".modal-backdrop").remove();

}

//& Funcion para verificar un formulario.
function VerifyForm(form) {

    for (let i = 0; i < form.length; i++) {

        if (form[i].value == "" || form[i].value < 1 || form[i].value == null || form[i].value == undefined) {
            return false;
        }

    }

    return true;

}

//& Función para reiniciar un formulario.
function ResetForm(form) {
    $(form)[0].reset();
}

//& Función para llenar el formulario de registro.
function FillEditForm(data) {

    let dataArray = data.split("||");
    let form = "#edicion-" + pageName;
    let formInputs = $(form + " input, " + form + " select");

    formInputs.each(function () {
        $(this).val(dataArray.shift());
    });

}

//& Función para agregar un registro.
function SubmitForm(form) {

    if (!VerifyForm($(form).serializeArray())) {

        Swal.fire({
            icon: "error",
            title: "Datos incompletos",
            text: "Rellene todos los campos para realizar un registro.",
            confirmButtonText: "Cerrar"
        });

        return;

    }

    let data = $(form).serialize();

    $.ajax({

        type: "POST",
        url: "php/" + pageName + "/insertar.php",
        data: data,
        success: function(ans) {

            if (ans === "success") {

                Swal.fire({
                    icon: "success",
                    title: "Registro agregado con éxito",
                    confirmButtonText: "Aceptar"
                });

                $("#modal-registro-" + pageName).modal("hide");
                
                ReloadDataTable(pageName);

            } else {

                Swal.fire({
                    icon: "question",
                    title: "No hay conexión con la base de datos",
                    text: "Revise la conexíon con la base de datos e intente de nuevo.",
                    confirmButtonText: "Cerrar"
                });

            }

        }

    });

}

//& Función para editar un registro.
function EditForm(form) {

    if (!VerifyForm($(form).serializeArray())) {

        Swal.fire({
            icon: "error",
            title: "Datos incompletos",
            text: "Rellene todos los campos para editar el registro.",
            confirmButtonText: "Cerrar"
        });

        return;

    }

    let data = $(form).serialize();

    $.ajax({

        type: "POST",
        url: "php/" + pageName + "/editar.php",
        data: data,
        success: function(ans) {

            if (ans === "success") {

                Swal.fire({
                    icon: "success",
                    title: "Registro editado con éxito",
                    confirmButtonText: "Aceptar"
                });

                $("#modal-edicion-" + pageName).modal("hide");
                ReloadDataTable(pageName);

            } else {

                Swal.fire({
                    icon: "question",
                    title: "No hay conexión con la base de datos",
                    text: "Revise la conexíon con la base de datos e intente de nuevo.",
                    confirmButtonText: "Cerrar"
                });

            }

        }

    });

}

//& Función para borrar un registro.
function DeleteItem(id) {

    Swal.fire({

        icon: "warning",
        title: "¿Desea borrar el registro?",
        text: "Esta acción no se puede revertir.",
        showCancelButton: true,
        confirmButtonText: "<span class='glyphicon glyphicon-trash'> </span> Eliminar",
        cancelButtonText: "<span class='glyphicon glyphicon-remove-sign'> </span> Cancelar"

    }).then((result) => {

        if (result.isConfirmed) {

            $.ajax({

                type: "POST",
                url: "php/" + pageName + "/borrar.php",
                data: {id: id},
                success: function(ans) {

                    if (ans === "success") {

                        ReloadDataTable(pageName);

                    } else {

                        Swal.fire({
                            icon: "question",
                            title: "No hay conexión con la base de datos",
                            text: "Revise la conexíon con la base de datos e intente de nuevo.",
                            confirmButtonText: "Cerrar"
                        });

                    }

                }

            });

        }

    });

}

//& Función para cambiar el estado de un registro.
function SwitchItemState(id) {

    $.ajax({

        type: "POST",
        url: "php/" + pageName + "/estado.php",
        data: {id: id},
        success: function(ans) {
            
            if (ans === "success") {

                ReloadDataTable(pageName);

            } else {

                Swal.fire({
                    icon: "question",
                    title: "No hay conexión con la base de datos",
                    text: "Revise la conexíon con la base de datos e intente de nuevo.",
                    confirmButtonText: "Cerrar"
                });

            }

        }

    });

}

//& Función para filtrar los registros de un select.
function FilterItems(value, target) {

    var matchOption = $(target + " option[value='']");

    $(target + " option").filter(function() {

        var currentText = $(this).text().toLowerCase().trim();
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        
        if (currentText.startsWith(value.trim()) && !value.trim() == "") {
            matchOption = $(this);
        }

    });

    $(target).val(matchOption.val());
    $(target + " option[value='']").hide();

}

//& Función para generar las siglas de un texto.
function GetAcronym(text) {

    if (typeof text !== "string" || text.trim() === "") {
        return "";
    }

    const words = text.trim().split(/\s+/);
    const acronymArray = words.filter(word => {

        if (/^[A-ZÁÉÍÓÚÑ]/.test(word) || word.length >= 5)
            return true;

        })
        .map(word => {
            
            const char = word.charAt(0).toUpperCase();
            return NormalizeChar(char);

        });
    const acronym = acronymArray.join("");
    console.log(acronym);
    
    return acronym;

}

//& Función para normalizar y quitar tildes a las letras.
function NormalizeChar(char) {

    return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

}

//& Función para obtener la abreviación guardada de un Plan de Estudios.
function GetAbbreviation(id, target) {

    $.ajax({

        type: "POST",
        url: "php/" + pageName + "/abreviacion.php",
        data: {id : id},
        success: function(ans) {

            $(target).val(ans);

        }

    });

}

//& Función para obtener la abreviación completa de un Programa Educativo.
function GetFullAbbreviation(form) {

    let values = [];
    $(form).children(".input-group .input-changeAbbr").each(function () {
        values.push($(this).val());
    });

    console.log(values.toString());
    //console.log($(form).children());

}