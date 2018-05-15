module.exports = function() {
	return function(req, res, next) {
		if (typeof req !== "undefined") {
			if (typeof req.session === "undefined") {
				req.session = {};
				req.session.user = null;
			}

			req.__proto__.setFlash = function(type, message) {
				req.session.flashMessages = req.session.flashMessages || [];
				req.session.flashMessages.push({type: type, message: message});
			};

			req.__proto__.setToast = function(type, message) {
				req.session.toastMessages = req.session.toastMessages || [];
				req.session.toastMessages.push({type: type, message: message});
			};

			req.__proto__.clearFlash = function() {
				req.session.flashMessages = [];
			}
		}

		next();
	};
};