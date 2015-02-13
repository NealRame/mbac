var _ = require('underscore');

function _404(message) {
    throw _.extend(new Error(message || 'Not found'), {status: 404});
};

function _500(err) {
    throw _.extend(err || new Error('Internal server error'), {status: 500});
};

module.exports = {
    API404: _404,
    API500: _500
};
