$(document).on('mousedown', '[data-ripple]', function(e) {
    let $self = $(this);

    let initPos = $self.css('position'),
        offs = $self.offset(),
        x = e.pageX - offs.left,
        y = e.pageY - offs.top,
        diameter = Math.min(this.offsetHeight, this.offsetWidth, 100),
        $ripple = $('<div/>', {class: 'ripple', appendTo: $self});
    
    if (!initPos || initPos === 'static') {
        $self.css({
            position:'relative'
        });
    }
    
    $('<div/>', {
        class : 'rippleWave',
        css : {
            background: $self.data('ripple'),
            width: diameter,
            height: diameter,
            left: x - (diameter / 2),
            top: y - (diameter / 2),
        },
        appendTo : $ripple,
        one : {
            animationend : function() {
                $ripple.remove();
            }
        }
    });
});