const utils = require('../utils');
const logger = require('../logger');
const nothrow = require('../nothrow');

module.exports = async function(eos, request, callback) {
    const rule = [
        {
            name: 'receiver',
            value: null,
            is_valid: function(value) {
                if (!utils.validateAccountName(value)) {
                    return false;
                }
                this.value = value;
                return true;
            }
        },
        {
            name: 'ramBytes',
            value: null,
            is_valid: function(value) {
                let rawbytes = parseInt(value)
                if (isNaN(rawbytes) || rawbytes <= 0) {
                    return false;
                }
                this.value = rawbytes;
                return true;
            }
        }
    ];
    if (!utils.validationParams(request, rule, callback)) {
        return;
    }

    let error, txid;
    [error, txid] = await nothrow(eos.asyncBuyRaw(rule[0].value, rule[1].value))
    if (error != null) {
        logger.warn('Failed to buy raw, receiver: %s, ramBytes: %s, %s',
            rule[0].value, rule[1].value, error.message);
        callback({code: -32603, message: error.message}, undefined);
        return;
    }
    logger.warn('Buy raw, receiver: %s, ramBytes: %s, txid: %s',
        rule[0].value, rule[1].value, txid);
    callback(undefined, txid);
}
