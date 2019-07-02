const sleep = require('./sleep');
const utils = require('./utils');
const nothrow = require('./nothrow');
const Notify = require('./notify');
const logger = require('./logger');
const latest = require('./latest');
const srvcfg = require('../config/server');

class Poller {
    constructor(eos) {
        this.eos = eos;
    }

    // 开始轮询
    async startPoll() {
        const limit = 100;
        let seq = latest.getSeq();
        while (true) {
            let count = await this._pollActions(seq, limit);
            let newseq = seq + count;
            if (newseq > seq) {
                seq = newseq;
                latest.updateSeq(newseq);
            }  
            await sleep(1000 * 10);
        }
    }

    // 轮询Actions
    async _pollActions(offset, limit) {
        // 获取actions
        let error, result;
        [error, result] = await nothrow(
            this.eos.rpc.getActions(srvcfg.account, offset, limit));
        if (error != null) {
            logger.info('Failed to get actions, %s, %s', srvcfg.account, error.message);
            return 0;
        }

        // 遍历actions
        let actions = result.actions;
        if (actions.length == 0) {
            return 0;
        }

        // 筛选转账action
        for (let i = 0; i < actions.length; i++) {
            let action = actions[i];
            let act = action.action_trace.act;
            let receipt = action.action_trace.receipt;

            if (!act.data.quantity) {
                continue;
            }
            if (act.name != 'transfer') {
                continue;
            }
            if (receipt.receiver != srvcfg.account) {
                continue;
            }

            let currency = utils.parseCurrency(act.data.quantity);
            let token = await this.eos.getToken(currency.symbol);
            if (token == null || act.account !== token.contract) {
                continue;
            }
            if (act.account != token.contract) {
                continue;
            }
            if (act.data.to != srvcfg.account) {
                continue;
            }

            let notify = new Notify();
            notify.to = act.data.to;
            notify.from = act.data.from;
            notify.memo = act.data.memo;
            notify.blockNumber = action.block_num;
            notify.hash = action.action_trace.trx_id;
            notify.symbol = currency.symbol;
            notify.amount = currency.amount;
            logger.warn('Transfer has been received, from: %s, to: %s, symbol: %s, amount: %s, memo: %s, txid: %s',
                notify.from, notify.to, notify.symbol, notify.amount, notify.memo, notify.hash);

            if (token.notify != null) {
                notify.post(token.notify);  
            }
        }
        return actions.length;
    }
}

module.exports = Poller;
