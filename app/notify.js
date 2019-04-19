const request = require('request');
const logger = require('./logger');

module.exports = function() {
    let symbol      = '';
    let from        = null;
    let to          = null;
    let hash        = null;
    let amount      = '0';
    let memo        = '';
    let blockNumber = 0;

    this.post = function(url) {
        this.type = 'transaction';
        let data = JSON.stringify(this);
        let options = {
            url: url,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data
        };
        request.post(options, function (error, response, body) {
            if (error != null) {
                logger.error('Failed to post notify: %s, %s', error.message, options.json);
            }
        });
    }
}