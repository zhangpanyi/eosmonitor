const utils = require('../utils');
const future = require('../future');
const server = require('../../config/server');

module.exports = async function(eos, request, callback) {
    const rule = [
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

    let error, account;
    [error, account] = await future(eos.getAccount(rule[0].value));
    if (error != null) {
        callback(error, undefined);
    }
    callback(undefined, account);
}
