export function init() {
    registerListener();
}

function registerListener() {

    $(".searchbox__input").on("keyup", function () {
        let $input = $(this);
        let $button = $input.closest(".searchbox").find("button");
        if ($input.val().length > 2 && $button.attr("tabindex") == -1) {
            $button.attr("tabindex", 0);
        } else if ($input.val().length == 0 && $button.attr("tabindex") == 0) {
            $button.attr("tabindex", -1);
        }
    });
}

