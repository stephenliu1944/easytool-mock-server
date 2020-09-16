function mockError(message = 'mock error', status = 500) {
    var error = new Error(message);
    error.status = status;
    return error;
}

module.exports = mockError;