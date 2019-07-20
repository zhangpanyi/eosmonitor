const rpc = require('node-json-rpc2');
const logger = require('./logger');
const srvcfg = require('../config/server');

class RPCServer {
    constructor(eos){
        this.eos = eos;
        let self = this;
        this._server = new rpc.Server(srvcfg);

        // 购买内存
        const buyraw = require('./handlers/buyraw');
        this._server.addMethod('buyRaw', function(request, callback) {
            buyraw(self.eos, request, callback);
        });

        // 代币转账
        const transfer = require('./handlers/transfer');
        this._server.addMethod('transfer', function(request, callback) {
            transfer(self.eos, request, callback);
        });

        // 内存市场
        const rammarket = require('./handlers/rammarket');
        this._server.addMethod('ramMarket', function(request, callback) {
            rammarket(self.eos, request, callback);
        });

        // 发行代币
        const issuetoken = require('./handlers/issuetoken');
        this._server.addMethod('issueToken', function(request, callback) {
            issuetoken(self.eos, request, callback);
        });

        // 获取账户信息
        const getaccount = require('./handlers/getaccount');
        this._server.addMethod('getAccount', function(request, callback) {
            getaccount(self.eos, request, callback);
        });

        // 创建新账户
        const newaccount = require('./handlers/newaccount');
        this._server.addMethod('newAccount', function(request, callback) {
            newaccount(self.eos, request, callback);
        });

        // 获取账户余额
        const getbalance = require('./handlers/getbalance');
        this._server.addMethod('getBalance', function(request, callback) {
            getbalance(self.eos, request, callback);
        });

        // 获取网络信息
        const getinfo = require('./handlers/getinfo');
        this._server.addMethod('getInfo', function(request, callback) {
            getinfo(self.eos, request, callback);
        });

        // 获取交易信息
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
