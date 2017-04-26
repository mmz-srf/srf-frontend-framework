export function init() {

    $(".input-field--success, .input-field--on-error").on("focusin", function () {
        $(this).addClass("input-field--no-icon");
    });
}
