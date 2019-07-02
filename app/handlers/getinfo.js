const nothrow = require('../nothrow');

module.exports = async function(eos, request, callback) {
    let error, info;
    [error, info] = await nothrow(eos.rpc.getInfo({}));
    if (error != null) {
        callback({code: -32603, message: error.message}, undefined);
        return;
    }
    callback(undefined, info);
}
