$ = function () {
    return $;
};

$.__proto__ = {
    ready: function () {},
    attr: function () {},
    ufm: function () {return $.fn.ufm.apply(this);},
    on: function () {},
    off: function () {}
};


$.fn = {};