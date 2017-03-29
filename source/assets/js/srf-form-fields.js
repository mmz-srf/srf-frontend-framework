export function init() {

    $(".radio-button, .checkbox").on("keypress", function (e) {
        // enable checking radios by tabbing in + <enter>
        if (e.keyCode === 13) {
            $(this).prop('checked', true);
            return false;
        }
    });
}