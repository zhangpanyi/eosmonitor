const utils = require('../utils');
const nothrow = require('../nothrow');
const server = require('../../config/server');

module.exports = async function(eos, request, callback) {
    const rule = [
        {
            name: 'symbol',
            value: 'EOS',
            is_valid: function(value) {
                if (!utils.validateSymbol(value)) {
                    return false;
                }
                this.value = value;
                return true;
            }
        },
        {
            name: 'account',
            value: server.account,
            is_valid: function(value) {
                if (!utils.validateAccountName(value)) {
                    return false;
                }
                this.value = value;
                return true;
            }
        }
    ];
    if (!utils.validationParams(request, rule, callback)) {
        return;
    }

    let error, balance;
    [error, balance] = await nothrow(eos.asyncGetBalance(rule[0].value, rule[1].value));
    if (error != null) {
        callback({code: -32603, message: error.message}, undefined);
        return;
    }
    callback(undefined, balance);
}
