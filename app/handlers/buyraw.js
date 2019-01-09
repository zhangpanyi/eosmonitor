const utils = require('../utils')
const logger = require('../logger')
const future = require('../future')

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
    [error, txid] = await future(eos.buyRaw(rule[0].value, rule[1].value))
    if (error != null) {
        logger.warn('Failed to buy raw, receiver: %s, ramBytes: %s, %s',
            rule[0].value, rule[1].value, error.message);
        callback(error, undefined);
        return;
    }
    logger.warn('Buy raw, receiver: %s, ramBytes: %s, txid: %s',
        rule[0].value, rule[1].value, txid);
    callback(undefined, txid);
}