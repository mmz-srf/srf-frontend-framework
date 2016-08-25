var SRF = SRF || {};
SRF.carousels = {
    css: {
        container: ".carousel",
        lazyLoad: "srf-lazyload",
        lazyloadImages: "img.srf-lazyload",
    },
    $carousels: [],
    $lazyImages: [],
    // checks if carousel images are already loading
    loadingCarousels: {},
    init: function () {
        var that = this;
        that.$carousels = $(that.css.container);
        that.$carousels.each(function (i, carousel) {
            var $carousel = $(carousel);
            $.merge(that.$lazyImages, $carousel.find(that.css.lazyloadImages));
        });
        that.registerListener();

    },
    registerListener: function () {
        var that = this;

        that.$carousels.on('slide.bs.carousel', function (e) {
            var $carousel = $(e.currentTarget);
            that.onSlide($carousel);
        });
        $.each(that.$lazyImages, function(i, img){
            var $img = $(img);
            $img.load(function (e) {
                var $img = $(e.currentTarget);
                //console.log("img loaded!" + $img.attr("src"));
                $img.parent().find(".media-link-meta").remove();
            });
        });

    },
    onSlide: function ($carousel) {
        var that = this;
        var carouselId = $carousel.attr("id");
        if (!that.loadingCarousels[carouselId]) {
            that.loadLazyImages($carousel);
            that.loadingCarousels[carouselId] = true;
        }
    },
    // once user starts gallery, load all images as fast as possible
    loadLazyImages: function ($carousel) {
        var that = this;

        var $images = $carousel.find(that.css.lazyloadImages);
        $images.each(function (i, image) {
            var $image = $(image);
            if ($image.data("src")) {
                //console.log("preloading image " + i);
                $image.attr("srcset", $image.data("srcset"));
                $image.attr("src", $image.data("src"));

            }
        });

    },
}
