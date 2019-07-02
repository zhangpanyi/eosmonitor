const utils = require('../utils');
const nothrow = require('../nothrow');

module.exports = async function(eos, request, callback) {
    let error, result;
    [error, result] = await nothrow(eos.ramMarket());
    if (error != null) {
        callback({code: -32603, message: error}, undefined);
        return;
    }
    if (!utils.validationParams(request, [], callback)) {
        return;
    }
    callback(undefined, result);
}
