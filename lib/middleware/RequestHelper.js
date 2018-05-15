module.exports = function() {
    return function(req, res, next) {
        if (typeof req !== "undefined") {
            req.__proto__.isPOST = function() {
                return req.method.toLowerCase() === "post";
            };
        }

        next();
    };
};