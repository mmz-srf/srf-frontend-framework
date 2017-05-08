export function init() {

    $(".radio-button, .checkbox").on("keypress", function (e) {
        // enable checking radios by tabbing in + <enter>
        if (e.keyCode === 13) {
            var isChecked = $(this).prop('checked') ? false : true;
            $(this).prop('checked', isChecked);
            return false;
        }
    });
}