function parseError(error) {
    if(Array.isArray(error)) {
        return error.map(err => err.message).join('\n');
    } else if (error.name == "ValidationError") {
        return Object.values(error.errors).map(value => value.message).join('\n');
    } else {
        return error.message;
    }
}

module.exports = {
    parseError
}