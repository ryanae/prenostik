var Toast = function() {
	toastr.options = {
		fadeOut: 200,
		fadeIn: 200,
		timeOut: 4000,
		positionClass: 'toast-bottom-right',
		toastClass: 'toast',
		iconClasses: {
			error: 'toast-error',
			info: 'toast-info',
			success: 'toast-success',
			warning: 'toast-warning'
		}
	};

	this.toastMessages();
};

Toast.prototype.toastMessages = function() {
	var self = this;
	$('div', '.toastMessages').each(function(i, el) {
		var content = $(el).html(),
			func = 'notifyInfo',
			title = 'Info';

		if ($(el).hasClass('toast-info')) {
			title = 'Info';
			func = 'notifyInfo';
		}

		if ($(el).hasClass('toast-error')) {
			title = 'Error';
			func = 'notifyError';
		}

		if ($(el).hasClass('toast-success')) {
			title = 'Success';
			func = 'notifySuccess';
		}

		if ($(el).attr('class') === 'toast') {
			title = 'Warning';
			func = 'notifyWarning';
		}

		self[func](title, content);
	});
};

Toast.prototype.notifyInfo = function(title, content) {
	toastr.info(content, '<i class="icon-info-sign"></i> <span>' + title + '</span>');
};

Toast.prototype.notifySuccess = function(title, content) {
	toastr.success(content, '<i class="icon-check-sign"></i> <span>' + title + '</span>');
};

Toast.prototype.notifyWarning = function(title, content) {
	toastr.warning(content, '<i class="icon-warning-sign"></i> <span>' + title + '</span>');
};

Toast.prototype.notifyError = function(title, content) {
	toastr.error(content, '<i class="icon-ban-circle"></i> <span>' + title + '</span>');
};

module.exports = new Toast;