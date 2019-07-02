const utils = require('../utils');
const nothrow = require('../nothrow');

module.exports = async function(eos, request, callback) {
    const rule = [
        {
            name: 'txid',
            value: null,
            is_valid: function(value) {
                this.value = value;
                return true;
            }
        }
    ];
    if (!utils.validationParams(request, rule, callback)) {
        return;
    }

    let error, tx;
    [error, tx] = await nothrow(eos.rpc.getTransaction(rule[0].value));
    if (error != null) {
        callback({code: -32603, message: error.message}, undefined);
        return;
    }
    callback(undefined, tx);
}
