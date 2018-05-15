module.exports = function() {
    return function(req, res, next) {
        if (typeof req !== "undefined") {
			// These paths can be accessed without login
            var allowedPaths = [
                '/',
                '/users/login',
                '/users/logout',
                '/users/forgot',
				'/relogin',
				'/expired_pass',
				'/lockout',
				'/expired_account',
                '/css/app.css',
                '/js/app.min.js',
        		'/js/jquery-1.10.2.min.map'
            ];

            var ignoredPaths = ['/favicon.ico'];

            if (allowedPaths.indexOf(req.path) === -1 && (typeof req.session.user === "undefined" || req.session.user === null))
			{
        		// console.log("HERE'S THE REQ PATH: ", req.path);
                if (ignoredPaths.indexOf(req.path) === -1)
				{
                    req.session.authRedirect = req.path;
                    req.setFlash('alert-error', 'You must be logged in to view this page.');
                    res.redirect('/users/login');
                }
            }
        }

        next();
    };
};
