$(document).ready(function () {

    $(document).on("change", "#pi-selector", function () {
        ChangePage($(this).val());
    });

    $(document).on("change", ".radio-q", function () {
        RecalcGrade($(this).data("grade"));
    });

    $(document).on("change", ".pi-radio-question2", function () {
        CalcTotalRadio($(this).data("grade"));
    });

    $(document).on("change", ".pi-name:not(readonly)", function () {
        $(".pi-name").val($(this).val());
    })

});

function ChangePage(page) {

    $(".print-page").hide().addClass("no-print");
    $(`.print-page[data-val=${page}]`).show().removeClass("no-print");

}

function RecalcGrade(id) {
    
    let grade = 0;

    $(`.radio-q[data-grade=${id}]:checked`).each(function () {
        grade += Number($(this).attr("value"));
    });

    $(`.calif${id}`).val(grade);

}

function CalcTotalRadio(id) {

    const checkRadios = [
        $(`.pi-radio-question2[value=0][data-grade=${id}]:checked`).length,
        $(`.pi-radio-question2[value=3][data-grade=${id}]:checked`).length,
        $(`.pi-radio-question2[value=4][data-grade=${id}]:checked`).length,
        $(`.pi-radio-question2[value=5][data-grade=${id}]:checked`).length,
    ];

    $(`.pi-radio-total${id}[data-radio=0]`).val(checkRadios[0]);
    $(`.pi-radio-total${id}[data-radio=3]`).val(checkRadios[1]);
    $(`.pi-radio-total${id}[data-radio=4]`).val(checkRadios[2]);
    $(`.pi-radio-total${id}[data-radio=5]`).val(checkRadios[3]);

}
