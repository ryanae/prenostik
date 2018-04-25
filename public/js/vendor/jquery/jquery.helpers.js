$.fn.toggleDisabled = function() {
    return this.each(function() {
        var $this = $(this);
        if ($this.attr('disabled')) $this.removeAttr('disabled');
        else $this.attr('disabled', 'disabled');
    });
};

$.fn.disableButton = function() {
    return this.each(function() {
        var $this = $(this);
        $this.attr('disabled', 'disabled');
        $this.addClass('disabled');
    });
};

$.fn.enableButton = function() {
    return this.each(function() {
        var $this = $(this);
        $this.removeAttr('disabled');
        $this.removeClass('disabled');
    });
};

$.fn.toggleChecked = function() {
    return this.each(function() {
        var $this = $(this);
        if ($this.attr('checked')) $this.removeAttr('checked');
        else $this.attr('checked', 'checked');
    });
};

$.fn.hasClasses = function(classes) {
    var result = true,
        $this = $(this);
    classes.forEach(function(className) {
        result = result && $this.hasClass(className);
    });
    return result;
}

$.fn.updateOptionsFromJSONList = function(options) {
    return this.each(function() {
        var $this = $(this);
        $('option', $this).remove();
        for (var id in options) {
            $this.append('<option value="' + id + '">' + options[id] + '</option>');
        }
    });
};