const future = require('../future');

module.exports = async function(eos, request, callback) {
    let error, info;
    [error, info] = await future(eos.rpc.getInfo({}));
    if (error != null) {
        callback(error, undefined);
        return;
    }
    callback(undefined, info);
}
