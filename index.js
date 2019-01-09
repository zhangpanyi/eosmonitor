let EOS = require('./app/eos')
let Poller = require('./app/poller')
let RPCServer = require('./app/rpcserver')

async function main() {
    let eos = new EOS();

    let poller = new Poller(eos);
    poller.startPoll();

    let server = new RPCServer(eos);
    server.start();
}

main();
