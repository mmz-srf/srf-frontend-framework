export function init() {
    registerListener();
}

function registerListener() {

    // we enable the <submit> button "as soon" as search text ist entered
    $(".searchbox").on("keyup", ".searchbox__input", function (e) {
        let $input = $(this);
        let $button = $input.closest(".searchbox").find("button");
        // this works mobile as well unlike <enter>-keys an d the likes
        if ($input.val().length > 2 && $button.attr("tabindex") == -1) {
            $button.attr("tabindex", 0).attr("aria-hidden", false);
        } else if ($input.val().length == 0 && $button.attr("tabindex") == 0) {
            $button.attr("tabindex", -1).attr("aria-hidden", true);
        }
    });
}

