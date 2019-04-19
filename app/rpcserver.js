const logger = require('./logger');
const rpc = require('node-json-rpc2');
const srvcfg = require('../config/server');

class RPCServer {
    constructor(eos){
        this.eos = eos;
        let self = this;
        this._server = new rpc.Server(srvcfg);
        const buyraw = require('./handlers/buyraw');
        this._server.addMethod('buyRaw', function(request, callback) {
            buyraw(self.eos, request, callback);
        });

        const transfer = require('./handlers/transfer');
        this._server.addMethod('transfer', function(request, callback) {
            transfer(self.eos, request, callback);
        });

        const rammarket = require('./handlers/rammarket');
        this._server.addMethod('ramMarket', function(request, callback) {
            rammarket(self.eos, request, callback);
        });

        const issuetoken = require('./handlers/issuetoken');
        this._server.addMethod('issueToken', function(request, callback) {
            issuetoken(self.eos, request, callback);
        });

        const getaccount = require('./handlers/getaccount');
        this._server.addMethod('getAccount', function(request, callback) {
            getaccount(self.eos, request, callback);
        });

        const newaccount = require('./handlers/newaccount');
        this._server.addMethod('newAccount', function(request, callback) {
            newaccount(self.eos, request, callback);
        });

        const getbalance = require('./handlers/getbalance');
        this._server.addMethod('getBalance', function(request, callback) {
            getbalance(self.eos, request, callback);
        });

        const getinfo = require('./handlers/getinfo');
        this._server.addMethod('getInfo', function(request, callback) {
            getinfo(self.eos, request, callback);
        });

        const gettransaction = require('./handlers/gettransaction');
        this._server.addMethod('getTransaction', function(request, callback) {
            gettransaction(self.eos, request, callback);
        });
    }

    start() {
        this._server.start(function (error) {
            if (error) {
                throw error;
            } else {
                logger.info('JSON RPC server started ...');
            }
        });
    }
}

module.exports = RPCServer
