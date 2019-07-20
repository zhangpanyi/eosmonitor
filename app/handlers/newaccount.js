const validator = require('validator');

const utils = require('../utils');
const logger = require('../logger');
const nothrow = require('../nothrow');

module.exports = async function(eos, request, callback) {
    const rule = [
        {
            name: 'account',
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
            name: 'owner_key',
            value: null,
            is_valid: function(value) {
                if (!utils.validatePublicKey(value)) {
                    return false;
                }
                this.value = value;
                return true;
            }
        },
        {
            name: 'active_key',
            value: null,
            is_valid: function(value) {
                if (!utils.validatePublicKey(value)) {
                    return false;
                }
                this.value = value;
                return true;
            }
        },
        {
            name: 'rawBytes',
            value: null,
            is_valid: function(value) {
                if (!validator.isInt(value)) {
                    return false;
                }
                this.value = parseInt(value);
                return true;
            }
        },
        {
            name: 'cpu',
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
            name: 'net',
            value: null,
            is_valid: function(value) {
                if (!validator.isFloat(value)) {
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

    let error, txid;
    [error, txid] = await nothrow(eos.asyncNewAccount(
        rule[0].value, rule[1].value, rule[2].value,
        rule[3].value, rule[4].value, rule[5].value));
    if (error != null) {
        logger.warn('Failed to new account, account: %s, %s',
            rule[0].value, error.message);
        callback({code: -32603, message: error.message}, undefined);
        return;
    }
    logger.warn('New account, account: %s, txid: %s', rule[0].value, txid);
    callback(undefined, txid);
}
