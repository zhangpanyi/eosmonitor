const fs = require('fs');
const eos = require('eosjs');
const BigNumber = require('bignumber.js');

const utils = require('./utils');
const nothrow = require('./nothrow');

const server = require('../config/server');
const tokens = require('../config/tokens');

class EOS {
    constructor() {
        this.rpc = eos({
            debug:              false,
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

    // 部署代币
    async asyncDeployToken() {
        let error, result;
        let abi = fs.readFileSync(`contracts/eosio.token/eosio.token.abi`);
        let wasm = fs.readFileSync(`contracts/eosio.token/eosio.token.wasm`);
        [error, result] = await nothrow(this.rpc.transaction(tr => {
            tr.setcode(server.account, 0, 0, wasm);
            tr.setabi(server.account, JSON.parse(abi));
        }));
        if (error != null) {
            throw error;
        }
        return result.transaction_id;
    }

    // 内存市场
    async asyncGetRamMarket() {
        let error, result;
        [error, result] = await nothrow(
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

    // 获取代币信息
    async asyncGetToken(symbol) {
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
        [error, stats] = await nothrow(
            this.rpc.getCurrencyStats(token.contract, symbol));
        if (error != null) {
            return null;
        }

        let currency = utils.parseCurrency(stats[symbol].max_supply);
        token.decimals = currency.decimal;
        this.tokens.set(symbol, token);
        return token;
    }

    // 获取账号信息
    async asyncGetAccount(account) {
        let error, info;
        [error, info] = await nothrow(this.rpc.getAccount(account));
        if (error != null) {
            throw error;
        }

        let accountInfo = {
            account: account,
            balance: '0',
            net_weight: '0',
            cpu_weight: '0',
            net_limit: info.net_limit,
            cpu_limit: info.cpu_limit,
            ram_usage: info.ram_usage,
            ram_bytes: info.total_resources.ram_bytes,
            created: info.created
        };
        if (info.core_liquid_balance) {
            accountInfo.balance = utils.parseCurrency(info.core_liquid_balance).amount;
        }
        if (info.self_delegated_bandwidth) {
            let netWeight = info.self_delegated_bandwidth.net_weight;
            let cpuWeight = info.self_delegated_bandwidth.cpu_weight;
            accountInfo.net_weight = utils.parseCurrency(netWeight).amount;
            accountInfo.cpu_weight = utils.parseCurrency(cpuWeight).amount;
        }
        return accountInfo;
    }

    // 获取代币余额
    async asyncGetBalance(symbol, account) {
        let token = await this.asyncGetToken(symbol);
        if (token == null) {
            throw new Error('symbol not found');
        }

        let error, balance;
        [error, balance] = await nothrow(
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

    // 购买内存
    async asyncBuyRaw(receiver, ramBytes) {
        let error, result;
        [error, result] = await nothrow(this.rpc.buyrambytes({
            payer: server.account,
            receiver: receiver,
            bytes: ramBytes
        }));
        if (error != null) {
            throw error;
        }
        return result.transaction_id;
    }

    // 代币转账
    async asyncTransfer(symbol, to, amount, memo) {
        let token = await this.asyncGetToken(symbol);
        if (token == null) {
            throw new Error('symbol not found');
        }

        let error, contract, result;
        [error, contract] = await nothrow(this.rpc.contract(token.contract));
        if (error != null) {
            throw error;
        }

        let options = {
            sign: true,
            broadcast: true,
            authorization: server.account+'@active'
        }
        let quantity = utils.formatCurrency(amount, token.symbol, token.decimals);
        [error, result] = await nothrow(contract.transfer({
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
    async asyncIssueToken(issuer, symbol, decimals, maxSupply) {
        let error, result;
        let currency = utils.formatCurrency(maxSupply, symbol, decimals);
        [error, result] = await nothrow(this.rpc.transaction({
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
    async asyncNewAccount(account, ownerKey, activeKey, rawBytes, cpu, net) {
        let error, result;
        [error, result] = await nothrow(this.rpc.transaction(tr => {
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
