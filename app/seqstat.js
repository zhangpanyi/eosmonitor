const fs = require('fs')
const ini = require('ini')

module.exports = {
    filename: 'seqstat.ini',

    getSeq : function() {
        if (!fs.existsSync(this.filename)) {
            fs.writeFileSync(this.filename, ini.stringify({}));
        }
        let config = ini.parse(fs.readFileSync(this.filename, 'utf-8'));
        return parseInt(config.seq) || 0;
    },

    updateSeq : function(seq) {
        let config = ini.parse(fs.readFileSync(this.filename, 'utf-8'));
        config.seq = seq;
        fs.writeFileSync(this.filename, ini.stringify(config));
    }
}