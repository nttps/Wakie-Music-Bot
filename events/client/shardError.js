const chalk = require('chalk')

module.exports = {
    run: async (client, error, id) => {
        console.log(chalk.red(`[ERROR] (${String(new Date()).split(' ', 5).join(' ')}) Shard ${id} Shard Errored!`))
    }
}
