var Form = function() {
	this.init();
}

Form.prototype.init = function() {
	this.initSelect();
	this.initSelect2();
	this.initCheckbox();
	this.initSwitch();
	this.initDatepicker();
	this.initSpinner();
}

Form.prototype.initSpinner = function() {
	$.widget("ui.customspinner", $.ui.spinner, {
		widgetEventPrefix: $.ui.spinner.prototype.widgetEventPrefix,
		_buttonHtml: function() { // Remove arrows on the buttons
			return "" +
				"<a class='ui-spinner-button ui-spinner-up ui-corner-tr'>" +
				"</a>" +
				"<a class='ui-spinner-button ui-spinner-down ui-corner-br'>" +
				"</a>";
		}
	});

	$('.flat-spinner').customspinner({
		min: 0,
		max: 999
	})
		.on('focus', function() {
			$(this).closest('.ui-spinner').addClass('focus');
		})
		.on('blur', function() {
			$(this).closest('.ui-spinner').removeClass('focus');
		});

};

Form.prototype.initDatepicker = function() {
	$('.flat-datepicker').datepicker({
		showOtherMonths: true,
		selectOtherMonths: true,
		dateFormat: "yy-mm-dd"
	});
	$.extend($.datepicker, {_checkOffset: function(inst, offset, isFixed) {return offset}});

};
Form.prototype.initSelect2 = function() {
	function formatIconOption(icon) {
		return '<i class="' + icon.id + '"></i> ' + icon.text;
	}

	$('select.fontawesome-icon-picker').select2({
		width: 'resolve',
		formatResult: formatIconOption,
		formatSelection: formatIconOption,
		escapeMarkup: function(m) { return m; }
	});

	$('select.select2-hidesearch').select2({
		width: 'resolve',
		minimumResultsForSearch: -1
	});

	$('select.select2-multi, select.select2').select2({
		width: 'resolve'
	});

    $('select.select2-input, select.select2').select2({
        width: 'resolve',
        maximumSelectionSize: 1
    });
};

Form.prototype.initSelect = function() {
	$("[data-toggle='select']").selectpicker({style: 'btn', menuStyle: 'dropdown-inverse'});
};

Form.prototype.initCheckbox = function() {
	$("[data-toggle='checkbox']").wrap('<label class="checkbox" />').checkbox();
};

Form.prototype.initSwitch = function() {
	$("[data-toggle='switch']").wrap('<div class="switch translate-toggle"/>').parent().bootstrapSwitch();
};

module.exports = new Form;
