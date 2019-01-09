const utils = require('../utils')
const logger = require('../logger')
const future = require('../future')
const validator = require('validator')

module.exports = async function(eos, request, callback) {
    const rule = [
        {
            name: 'issuer',
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
            name: 'symbol',
            value: null,
            is_valid: function(value) {
                if (!utils.validateSymbol(value)) {
                    return false;
                }
                this.value = value;
                return true;
            }
        },
        {
            name: 'decimals',
            value: null,
            is_valid: function(value) {
                let decimals = parseInt(value);
                if (isNaN(decimals) || decimals < 0 || decimals > 18) {
                    return false;
                }
                this.value = decimals;
                return true;
            }
        },
        {
            name: 'maxSupply',
            value: null,
            is_valid: function(value) {
                if (!validator.isInt(value)) {
                    return false;
                }
                this.value = value;
                return true;
            }
        }
    ]
    if (!utils.validationParams(request, rule, callback)) {
        return;
    }

    let error, txid
    [error, txid] = await future(eos.issueToken(
        rule[0].value, rule[1].value, rule[2].value, rule[3].value));
    if (error != null) {
        logger.warn('Failed to issue token, issuer: %s, symbol: %s, decimals: %s, maxSupply: %s, %s',
            rule[0].value, rule[1].value, rule[2].value, rule[3].value, error.message);
        callback({code: -32603, message: error.message}, undefined);
        return;
    }

    logger.warn('Issue token, issuer: %s, symbol: %s, decimals: %s, maxSupply: %s, txid: %s',
        rule[0].value, rule[1].value, rule[2].value, rule[3].value, txid);
    callback(undefined, txid);
}
