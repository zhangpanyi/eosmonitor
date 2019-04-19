# eosmonitor

EOS中间件服务，提供账号监控、收款通知、创建账号、发行代币等JSON RPC接口。可以使用它轻松地将EOS上的代币接入到自己的系统里面。

> 测试环境：node.js v8.10.0

## 1. 快速开始
```
git clone https://github.com/zhangpanyi/eosmonitor.git
cd eosmonitor
npm install
node index.js
```

### Docker
```
docker volume create eosmonitor-logs-data-volume
docker-compose build
docker-compose up
```

## 2. 配置文件
由于工程中只有配置模板，第一次启动服务前必须执行 `node init_config.js` 命令，用于自动生成配置文件，然后酌情修改。

`config/server.js` JSON-RPC服务配置，可自定义以下选项：
```
{
    host:           '0.0.0.0',                                                          // 绑定地址
    port:           18080,                                                              // 端口号
    account:        'helloeosgogo',                                                     // EOS 账号
    endpoint:       'https://junglehistory.cryptolions.io',                             // EOS网络接入点
    chainId:        '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca', // 链ID
    keyProvider:    '5JxpDLxnT3xeLKrXGxE4gPQg6ZXA6FRoNsgz1E44Lwi1DocVtyX',              // 账号active私钥
    // auth: {                                                                          // 认证信息
    //     users: [
    //         {
    //             login: "username",
    //             hash: "password"
    //         }
    //     ]
    // }
}
```

`config/tokens.js` Token配置文件，用于配置ETH和ERC20 Token钱包信息。
```
[
    {
        symbol: 'EOS',              // 代币符号
        contract: 'eosio.token',    // 合约账号
        decimals: null,             // 代币精度(自动获取)
        notify: null,               // 通知HTTP地址
    }
]

```

## 3. JSON-RPC 2 接口

### 1. 购买内存

**接口：**
```
buyRaw(account: string, rawbytes: int) txid:string
```

**请求示例：**
```
{"jsonrpc": "2.0", "method": "buyRaw", "params": ["zhangpanyi45", 4096], "id": "1"}
```

**返回结果：**
```
{"id":"1","result":"223b160431b719d7fee27185f2614f04208117357664f1c02c08853bb6ab6777"}
```

### 2. 获取账号信息

**接口：**
```
getAccount(account: string) Object
```

**请求示例：**
```
{"jsonrpc": "2.0", "method": "getAccount", "params": ["helloeosgogo"], "id": "1"}
```

**返回结果：**
```
{"id":"1","result":{"account":"helloeosgogo","net_limit":{"used":15186,"available":19110362,"max":19125548},"cpu_limit":{"used":12880,"available":3625912,"max":3638792},"ram_usage":198628,"ram_bytes":411616,"net_weight":"100.0000","cpu_weight":"100.0000","balance":"69.1047","created":"2018-11-12T13:38:56.000"}}
```

### 3. 获取代币余额

**接口：**
```
getBalance(symbol: string, account: string) string
```

**请求示例：**
```
{"jsonrpc": "2.0", "method": "getBalance", "params": ["EOS", "helloeosgogo"], "id": "1"}
```

**返回结果：**
```
{"id":"1","result":"59.7110"}
```

### 4. 获取网络信息

**接口：**
```
getInfo() Object
```

**请求示例：**
```
{"jsonrpc": "2.0", "method": "getInfo", "params": [], "id": "1"}
```

**返回结果：**
```
{"id":"1","result":{"server_version":"0f6695cb","chain_id":"038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca","head_block_num":24771152,"last_irreversible_block_num":24770846,"last_irreversible_block_id":"0179f91e0dff674dc3b3f7664985cacf62bf50897a6cf158511ec4f406674e50","head_block_id":"0179fa50068ea4b5ce79ea8987c917368a22df28c332c2035b7bb9293914f4ae","head_block_time":"2018-11-17T01:46:20.000","head_block_producer":"lioninjungle","virtual_block_cpu_limit":200000000,"virtual_block_net_limit":1048576000,"block_cpu_limit":199900,"block_net_limit":1048576,"server_version_string":"v1.3.0-dirty"}}
```

### 5. 获取交易信息

**接口：**
```
getTransaction(txid: string) Object
```

**请求示例：**
```
{"jsonrpc": "2.0", "method": "getTransaction", "params": ["2e0b9f280edf27b8811e3d8b5bab51329af4d88fcd2ea8f4b54179eab47bfc89"], "id": "1"}
```

**返回结果：**
```
{"id":"1","result":{"id":"2e0b9f280edf27b8811e3d8b5bab51329af4d88fcd2ea8f4b54179eab47bfc89","trx":{"receipt":{"status":"executed","cpu_usage_us":818,"net_usage_words":17,"trx":[1,{"signatures":["SIG_K1_K5M79SzBUyLTwZUYxpZ8KJwfZ38hbWjdVgPDCJMhCt5PsKB5w49sYPu61Rtf5z7G8L8Yozs7W5gkGSr3FbdERfPpAVQABy"],"compression":"none","packed_context_free_data":"","packed_trx":"4d75ef5bf0fc434ddb19000000000100a6823403ea3055000000572d3ccdcd01401965982a1aa36a00000000a8ed323225401965982a1aa36a3084f3d354364dfb102700000000000004454f5300000000047465737400"}]},"trx":{"expiration":"2018-11-17T01:56:29","ref_block_num":64752,"ref_block_prefix":433802563,"max_net_usage_words":0,"max_cpu_usage_ms":0,"delay_sec":0,"context_free_actions":[],"actions":[{"account":"eosio.token","name":"transfer","authorization":[{"actor":"helloeosgogo","permission":"active"}],"data":{"from":"helloeosgogo","to":"zhangpanyi23","quantity":"1.0000 EOS","memo":"test"},"hex_data":"401965982a1aa36a3084f3d354364dfb102700000000000004454f53000000000474657374"}],"transaction_extensions":[],"signatures":["SIG_K1_K5M79SzBUyLTwZUYxpZ8KJwfZ38hbWjdVgPDCJMhCt5PsKB5w49sYPu61Rtf5z7G8L8Yozs7W5gkGSr3FbdERfPpAVQABy"],"context_free_data":[]}},"block_time":"2018-11-17T01:55:34.000","block_num":24772155,"last_irreversible_block":24771859,"traces":[{"receipt":{"receiver":"eosio.token","act_digest":"035f3e7786ee6bdf3f988978fcaeac028e81c518afe31e5eb133ff7feb6afd38","global_sequence":55066881,"recv_sequence":3222253,"auth_sequence":[["helloeosgogo",97]],"code_sequence":5,"abi_sequence":5},"act":{"account":"eosio.token","name":"transfer","authorization":[{"actor":"helloeosgogo","permission":"active"}],"data":{"from":"helloeosgogo","to":"zhangpanyi23","quantity":"1.0000 EOS","memo":"test"},"hex_data":"401965982a1aa36a3084f3d354364dfb102700000000000004454f53000000000474657374"},"context_free":false,"elapsed":225,"cpu_usage":0,"console":"","total_cpu_usage":0,"trx_id":"2e0b9f280edf27b8811e3d8b5bab51329af4d88fcd2ea8f4b54179eab47bfc89","block_num":24772155,"block_time":"2018-11-17T01:55:34.000","producer_block_id":"0179fe3bd68f89944b8a068e6584cf5ef807e643d54e21b0645aff5f296cf956","account_ram_deltas":[{"account":"helloeosgogo","delta":240}],"inline_traces":[{"receipt":{"receiver":"helloeosgogo","act_digest":"035f3e7786ee6bdf3f988978fcaeac028e81c518afe31e5eb133ff7feb6afd38","global_sequence":55066882,"recv_sequence":46,"auth_sequence":[["helloeosgogo",98]],"code_sequence":5,"abi_sequence":5},"act":{"account":"eosio.token","name":"transfer","authorization":[{"actor":"helloeosgogo","permission":"active"}],"data":{"from":"helloeosgogo","to":"zhangpanyi23","quantity":"1.0000 EOS","memo":"test"},"hex_data":"401965982a1aa36a3084f3d354364dfb102700000000000004454f53000000000474657374"},"context_free":false,"elapsed":29,"cpu_usage":0,"console":"","total_cpu_usage":0,"trx_id":"2e0b9f280edf27b8811e3d8b5bab51329af4d88fcd2ea8f4b54179eab47bfc89","block_num":24772155,"block_time":"2018-11-17T01:55:34.000","producer_block_id":"0179fe3bd68f89944b8a068e6584cf5ef807e643d54e21b0645aff5f296cf956","account_ram_deltas":[],"inline_traces":[]},{"receipt":{"receiver":"zhangpanyi23","act_digest":"035f3e7786ee6bdf3f988978fcaeac028e81c518afe31e5eb133ff7feb6afd38","global_sequence":55066883,"recv_sequence":1,"auth_sequence":[["helloeosgogo",99]],"code_sequence":5,"abi_sequence":5},"act":{"account":"eosio.token","name":"transfer","authorization":[{"actor":"helloeosgogo","permission":"active"}],"data":{"from":"helloeosgogo","to":"zhangpanyi23","quantity":"1.0000 EOS","memo":"test"},"hex_data":"401965982a1aa36a3084f3d354364dfb102700000000000004454f53000000000474657374"},"context_free":false,"elapsed":6,"cpu_usage":0,"console":"","total_cpu_usage":0,"trx_id":"2e0b9f280edf27b8811e3d8b5bab51329af4d88fcd2ea8f4b54179eab47bfc89","block_num":24772155,"block_time":"2018-11-17T01:55:34.000","producer_block_id":"0179fe3bd68f89944b8a068e6584cf5ef807e643d54e21b0645aff5f296cf956","account_ram_deltas":[],"inline_traces":[]}]},{"receipt":{"receiver":"helloeosgogo","act_digest":"035f3e7786ee6bdf3f988978fcaeac028e81c518afe31e5eb133ff7feb6afd38","global_sequence":55066882,"recv_sequence":46,"auth_sequence":[["helloeosgogo",98]],"code_sequence":5,"abi_sequence":5},"act":{"account":"eosio.token","name":"transfer","authorization":[{"actor":"helloeosgogo","permission":"active"}],"data":{"from":"helloeosgogo","to":"zhangpanyi23","quantity":"1.0000 EOS","memo":"test"},"hex_data":"401965982a1aa36a3084f3d354364dfb102700000000000004454f53000000000474657374"},"context_free":false,"elapsed":29,"cpu_usage":0,"console":"","total_cpu_usage":0,"trx_id":"2e0b9f280edf27b8811e3d8b5bab51329af4d88fcd2ea8f4b54179eab47bfc89","block_num":24772155,"block_time":"2018-11-17T01:55:34.000","producer_block_id":"0179fe3bd68f89944b8a068e6584cf5ef807e643d54e21b0645aff5f296cf956","account_ram_deltas":[],"inline_traces":[]},{"receipt":{"receiver":"zhangpanyi23","act_digest":"035f3e7786ee6bdf3f988978fcaeac028e81c518afe31e5eb133ff7feb6afd38","global_sequence":55066883,"recv_sequence":1,"auth_sequence":[["helloeosgogo",99]],"code_sequence":5,"abi_sequence":5},"act":{"account":"eosio.token","name":"transfer","authorization":[{"actor":"helloeosgogo","permission":"active"}],"data":{"from":"helloeosgogo","to":"zhangpanyi23","quantity":"1.0000 EOS","memo":"test"},"hex_data":"401965982a1aa36a3084f3d354364dfb102700000000000004454f53000000000474657374"},"context_free":false,"elapsed":6,"cpu_usage":0,"console":"","total_cpu_usage":0,"trx_id":"2e0b9f280edf27b8811e3d8b5bab51329af4d88fcd2ea8f4b54179eab47bfc89","block_num":24772155,"block_time":"2018-11-17T01:55:34.000","producer_block_id":"0179fe3bd68f89944b8a068e6584cf5ef807e643d54e21b0645aff5f296cf956","account_ram_deltas":[],"inline_traces":[]}]}}
```

### 6. 发行代币

**接口：**
```
issueToken(issuer: string, symbol: string, decimals: int, maxSupply: int) string
```

**请求示例：**
```
{"jsonrpc": "2.0", "method": "issueToken", "params": ["helloeosgogo", "YOYOW", 4, 100000000], "id": "1"}
```

**返回结果：**
```
{"id":"1","result":"b13cdbee1af3645b97952fb0c0aef7e3332ff47366d14a6855ca4648887ced2e"}
```

### 7. 创建账号

**接口：**
```
newAccount(account: string, ownerKey: string, activeKey: string, rawBytes: int, net: number, cpu: number) string
```

**请求示例：**
```
{"jsonrpc": "2.0", "method": "newAccount", "params": ["zhangpanyi45", "EOS5vo9NnQkzeF8NDmyDuVwYGKGEAUUnP9wJJR3UAFQCz1VCT7vA8", "EOS5vo9NnQkzeF8NDmyDuVwYGKGEAUUnP9wJJR3UAFQCz1VCT7vA8", 4096, 1, 1], "id": "1"}
```

**返回结果：**
```
{"id":"1","result":"5f5fdedaea0617c0438d2987bb38bfbce63c877fe81ea7eccfc534a3c2fbd369"}
```

### 8. 内存市场信息

**接口：**
```
ramMarket() Object
```

**请求示例：**
```
{"jsonrpc": "2.0", "method": "ramMarket", "params": [], "id": "1"}
```

**返回结果：**
```
{"id":"1","result":{"supply":"10000000000.0000 RAMCORE","base":{"balance":"31202833112 RAM","weight":"0.50000000000000000"},"quote":{"balance":"2355166.3346 EOS","weight":"0.50000000000000000"},"price":"0.00015095849316927885"}}
```

### 9. 代币转账

**接口：**
```
transfer(symbol: string, to: string, amount: number, memo: string) string
```

**请求示例：**
```
{"jsonrpc": "2.0", "method": "transfer", "params": ["EOS", "zhangpanyi23", 1, "test"], "id": "1"}
```

**返回结果：**
```
{"id":"1","result":"2e0b9f280edf27b8811e3d8b5bab51329af4d88fcd2ea8f4b54179eab47bfc89"}
```
