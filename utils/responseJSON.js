const responseJSON = (res, status = 200, message = '') => res.status(status).json(message).end();
module.exports = responseJSON