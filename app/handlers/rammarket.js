const utils = require('../utils')
const future = require('../future')

module.exports = async function(eos, request, callback) {
    let error, result;
    [error, result] = await future(eos.ramMarket());
    if (error != null) {
        callback({code: -32603, message: error}, undefined);
        return;
    }
    if (!utils.validationParams(request, [], callback)) {
        return;
    }
    callback(undefined, result);
}
