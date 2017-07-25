export function init() {
    registerListener();
}

function registerListener() {

    $(".searchbox__input").on("keyup", function () {
        let $input = $(this);
        let $button = $input.closest(".searchbox").find("button");
        if ($input.val().length > 2 && $button.attr("tabindex") == -1) {
            $button.attr("tabindex", 0).attr("aria-hidden", false);
        } else if ($input.val().length == 0 && $button.attr("tabindex") == 0) {
            $button.attr("tabindex", -1).attr("aria-hidden", true);
        }
    });

    $(".searchbox").on("submit", function () {
        let $input = $(this).find(".searchbox__input");
        $input.val("");
        $input.closest(".searchbox").find("button").attr("tabindex", -1).attr("aria-hidden", true);
    });
}

