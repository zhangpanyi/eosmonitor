const fs = require('fs');
const ini = require('ini');

module.exports = {
    // 存储路径
    getPath: function() {
        if (!fs.existsSync('db')) {
            fs.mkdirSync('db');
        }
        return 'db/latest.ini';
    },

    getSeq : function() {
        const path = this.getPath();
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, ini.stringify({}));
        }
        let config = ini.parse(fs.readFileSync(path, 'utf-8'));
        return parseInt(config.seq) || 0;
    },

    updateSeq : function(seq) {
        const path = this.getPath();
        let config = ini.parse(fs.readFileSync(path, 'utf-8'));
        config.seq = seq;
        fs.writeFileSync(path, ini.stringify(config));
    }
}