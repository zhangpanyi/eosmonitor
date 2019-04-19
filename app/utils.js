const BigNumber = require('bignumber.js');

module.exports = {
    // 解析货币信息
    parseCurrency: function(currency) {
        let decimal = 0;
        currency = currency.toString();
        let result = currency.split(' ', 2);
        let amount = result[0];
        let symbol = result[1];
        result = amount.split('.', 2);
        if (result.length > 1) {
            decimal = result[1].length;
        }
        return {
            amount: amount,
            symbol: symbol,
            decimal: decimal
        }
    },

    // 格式化货币信息
    formatCurrency: function(amount, symbol, decimals) {
        amount = new BigNumber(amount);
        amount = amount.toFixed(decimals);
        return amount + ' ' + symbol;
    },

     // 验证符号名
    validateSymbol: function(value) {
        if (value.length < 2 || value.length > 5) {
            return false;
        }

        for (let i = 0; i < value.length; i++) {
            let ch = value[i];
            if (!(ch >= 'A' && ch <= 'Z')) {
                return false;
            }
        }
        return true;
    },

    // 验证公钥
    validatePublicKey: function(value) {
        if (value.length !== 53) {
            return false;
        }

        let head = value.slice(0, 3);
        let tail = value.slice(3, value.length);
        if (head !== 'EOS') {
            return false;
        }
        for (let i = 0; i < tail.length; i++) {
            let ch = tail[i];
            if (
                !(ch >= '0' && ch <= '9') &&
                !(ch >= 'a' && ch <= 'z') &&
                !(ch >= 'A' && ch <= 'Z')
            ) {
                return false;
            }
        }
        return true;
    },

    // 验证账号名
    validateAccountName: function(value) {
        for (let i = 0; i < value.length; i++) {
            let ch = value[i];
            if (
                ch !== '.' &&
                !(ch >= '0' && ch <= '5') &&
                !(ch >= 'a' && ch <= 'z')
            ) {
                return false;
            }
        }
        return true;
    },

    // 验证参数规则
    validationParams: function(request, rule, callback) {
        let params = request.params;
        for (let i = 0; i < rule.length; i++) {
            if (i >= params.length) {
                if (rule[i].value == null) {
                    let error = {code: -32602, message: rule[i].name+' is required'};
                    callback(error, undefined);
                    return false;
                }
                continue;
            }

            if (!rule[i].is_valid(params[i].toString())) {
                let error = {code: -32602, message: rule[i].name+' is invalid param'};
                callback(error, undefined);
                return false;
            }
        }
        return true;
    }
}
