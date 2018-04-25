/*******************************************
 * App Context
 */

var ctxApp = {};

(function(context) {

})(ctxApp);

/*******************************************
 * Socket Context
 */

var ctxSocket = {};

(function(context) {
    context.socket = null;

    context.emit = function(event, data) {
        var parts = $.cookie('connect.sid').match(/s:(.*)\.(.*)/);
        var sid = parts[1];
        context.socket.emit(event, sid, data);
    };

    context.on = function(event, cb) {
        context.socket.on(event, cb);
    };
})(ctxSocket);


/*******************************************
 * On Ready
 */

$(document).ready(function() {

    /*******************************************
     * Events
     */

    $('body').on('click', '.btn-add', function(e) {
        e.preventDefault();
        var $source = $('#source').clone();
        $('.rows').append($source);
        $source.slideDown('fast');
        convertFileInputs($source);
    });

    $('body').on('click', '.btn-remove', function(e) {
        e.preventDefault();
        $(this).parentsUntil('.row').parent().slideUp('fast', function() { $(this).remove() });
    });

    /*******************************************
     * Init Plugins
     */

        // Init date pickers
    $('.fdatepicker').fdatepicker({format: 'yyyy-mm-dd', closeButton: false});

    // Init select2 select menus
    $('.select2').select2();

    // Convert file inputs to custom inputs
    function convertFileInputs(context) {
        $("input[type=file]", context).each(function() {
            if ($(this).hasClass('converted')) return;
            $(this).addClass('converted');
            var proxy = $('<div class="row collapse" style="postion: absolute;"><div class="large-9 columns"><input placeholder="No file chosen" type="text" value="' + $(this).val() + '" /></div><div class="large-3 columns"><div class="button secondary prefix">Browse</div></div></div>');

            var context = {_this: $(this), _proxy: proxy.find('input')};
            var intervalFunc = $.proxy(function() {
                this._proxy.val(this._this.val());
            }, context);

            // hide file input and watch for changes
            $(this)
                    .css("position", "absolute")
                    .css("opacity", "0.000001")
                    .css("z-index", "999")
                    .attr("size", "100")
                    .parent().append(proxy)
                    .click(function() {
                        setInterval(intervalFunc, 1000);
                    });
        });
    }

    convertFileInputs('body');

    /*******************************************
     * Socket Events
     */

    ctxSocket.socket = io.connect('/');

    ctxSocket.emit('CONNECTED', 'hi there');

    ctxSocket.on('event', function(data) {
        // do stuff
    });
});