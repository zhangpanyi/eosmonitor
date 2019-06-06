const future = require('../future');

module.exports = async function(eos, request, callback) {
    let error, info;
    [error, info] = await future(eos.rpc.getInfo({}));
    if (error != null) {
        callback({code: -32603, message: error.message}, undefined);
        return;
    }
    callback(undefined, info);
}
