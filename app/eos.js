const fs = require('fs');
const eos = require('eosjs');
const utils = require('./utils');
const future = require('./future');
const BigNumber = require('bignumber.js');
const server = require('../config/server');
const tokens = require('../config/tokens');

class EOS {
    constructor() {
        this.rpc = eos({
            debug: true,
            httpEndpoint:       server.endpoint,
            verbose:            false,
            expireInSeconds:    60,
            broadcast:          true,
            sign:               true,
            chainId:            server.chainId,
            keyProvider:        server.keyProvider
        });
        this.tokens = new Map();
    }

    // 代币信息
    async getToken(symbol) {
        if (this.tokens.has(symbol)) {
            return this.tokens.get(symbol);
        }

        let token = null;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].symbol === symbol) {
                token = tokens[i];
                break;
            }
        }
        if (token == null) {
            return null;
        }

        let error, stats;
        [error, stats] = await future(
            this.rpc.getCurrencyStats(token.contract, symbol));
        if (error != null) {
            return null;
        }

        let currency = utils.parseCurrency(stats[symbol].max_supply);
        token.decimals = currency.decimal;
        this.tokens.set(symbol, token);
        return token;
    }

    // 购买内存
    async buyRaw(receiver, ramBytes) {
        let error, result;
        [error, result] = await future(this.rpc.buyrambytes({
            payer: server.account,
            receiver: receiver,
            bytes: ramBytes
        }));
        if (error != null) {
            throw error;
        }
        return result.transaction_id;
    }

    // 部署代币
    async deployToken() {
        let error, result;
        let abi = fs.readFileSync(`contracts/eosio.token/eosio.token.abi`);
        let wasm = fs.readFileSync(`contracts/eosio.token/eosio.token.wasm`);
        [error, result] = await future(this.rpc.transaction(tr => {
            tr.setcode(server.account, 0, 0, wasm);
            tr.setabi(server.account, JSON.parse(abi));
        }));
        if (error != null) {
            throw error;
        }
        return result.transaction_id;
    }

    // 内存市场
    async ramMarket() {
        let error, result;
        [error, result] = await future(
            this.rpc.getTableRows(true, 'eosio', 'eosio', 'rammarket'));
        if (error != null) {
            throw error;
        }

        let rammarket = result.rows[0];
        let connectorWeight = BigNumber(rammarket.quote.weight);
        let connectorBalance = BigNumber(utils.parseCurrency(rammarket.quote.balance).amount);
        let outstandingSupply = BigNumber(utils.parseCurrency(rammarket.base.balance).amount);
        let price = connectorBalance.dividedBy(outstandingSupply.multipliedBy(connectorWeight));
        rammarket.price = price.toString(10);
        return rammarket;
    }

    // 账号信息
    async getAccount(account) {
        let error, info;
        [error, info] = await future(this.rpc.getAccount(account));
        if (error != null) {
            throw error;
        }

        let netWeight = info.self_delegated_bandwidth.net_weight;
        let cpuWeight = info.self_delegated_bandwidth.cpu_weight;
        let accountInfo = {
            account: account,
            net_limit: info.net_limit,
            cpu_limit: info.cpu_limit,
            ram_usage: info.ram_usage,
            ram_bytes: info.total_resources.ram_bytes,
            net_weight: utils.parseCurrency(netWeight).amount,
            cpu_weight: utils.parseCurrency(cpuWeight).amount,
            balance: utils.parseCurrency(info.core_liquid_balance).amount,
            created: info.created
        };
        return accountInfo;
    }

    // 代币余额
    async getBalance(symbol, account) {
        let token = await this.getToken(symbol);
        if (token == null) {
            throw new Error('symbol not found');
        }

        let error, balance;
        [error, balance] = await future(
            this.rpc.getCurrencyBalance(token.contract, account, symbol));
        if (error != null) {
            throw error;
        }
        if (balance.length == 0) {
            return '0';
        }
        let amount = utils.parseCurrency(balance[0]).amount;
        return amount;
    }

    // 代币转账
    async transfer(symbol, to, amount, memo) {
        let token = await this.getToken(symbol);
        if (token == null) {
            throw new Error('symbol not found');
        }

        let error, contract, result;
        [error, contract] = await future(this.rpc.contract(token.contract));
        if (error != null) {
            throw error;
        }

        let options = {
            sign: true,
            broadcast: true,
            authorization: server.account+'@active'
        }
        let quantity = utils.formatCurrency(amount, token.symbol, token.decimals);
        [error, result] = await future(contract.transfer({
            from:       server.account,
            to:         to,
            quantity:   quantity,
            memo:       memo
        }, options));
        if (error != null) {
            throw error;
        }
        return result.transaction_id;
    }

    // 发行代币
    async issueToken(issuer, symbol, decimals, maxSupply) {
        let error, result;
        let currency = utils.formatCurrency(maxSupply, symbol, decimals);
        [error, result] = await future(this.rpc.transaction({
            actions: [
                {
                    account: server.account,
                    name: 'create',
                    authorization: [{
                        actor: server.account,
                        permission: 'active'
                    }],
                    data: {
                        issuer: issuer,
                        maximum_supply: currency
                    }
                },
                {
                    account: server.account,
                    name: 'issue',
                    authorization: [{
                        actor: server.account,
                        permission: 'active'
                    }],
                    data: {
                        to: issuer,
                        quantity: currency,
                        memo: 'issue'
                    }
                }
            ]
        }));
        if (error != null) {
            throw error;
        }
        return result.transaction_id;
    }

    // 创建账号
    async newAccount(account, ownerKey, activeKey, rawBytes, cpu, net) {
        let error, result;
        [error, result] = await future(this.rpc.transaction(tr => {
            tr.newaccount({
                creator: server.account,
                name: account,
                owner: ownerKey,
                active: activeKey
            });

            tr.buyrambytes({
                payer: server.account,
                receiver: account,
                bytes: rawBytes
            });
        
            tr.delegatebw({
                from: server.account,
                receiver: account,
                stake_net_quantity: utils.formatCurrency(cpu, 'EOS', 4),
                stake_cpu_quantity: utils.formatCurrency(net, 'EOS', 4),
                transfer: 0
            });
        }));
        if (error != null) {
            throw error;
        }
        return result.transaction_id;
    }
}

module.exports = EOS;
