const utils = require('../utils');
const logger = require('../logger');
const future = require('../future');
const validator = require('validator');
const srvcfg = require('../../config/server');

module.exports = async function(eos, request, callback) {
    const rule = [
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
            name: 'to',
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
            name: 'amount',
            value: null,
            is_valid: function(value) {
                if (!validator.isFloat(value)) {
                    return false;
                }
                this.value = value;
                return true;
            }
        },
        {
            name: 'memo',
            value: null,
            is_valid: function(value) {
                if (value.length > 128) {
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

    if (rule[1].value === srvcfg.account) {
        let error = {code: -32602, message: "can't transfer money to oneself"};
        callback(error, undefined);
        return;
    }

    let error, txid;
    [error, txid] = await future(
        eos.transfer(rule[0].value, rule[1].value, rule[2].value, rule[3].value)
    )
    if (error != null) {
        logger.warn('Failed to transfer, symbol: %s, to: %s, amount: %s, memo: %s, %s',
            rule[0].value, rule[1].value, rule[2].value, rule[3].value, error.message);
        callback(error, undefined);
        return;
    }
    logger.warn('Transfer success, symbol: %s, to: %s, amount: %s, memo: %s, txid: %s',
        rule[0].value, rule[1].value, rule[2].value, rule[3].value, txid);
    callback(undefined, txid);
}
