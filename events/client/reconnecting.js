const chalk = require('chalk')
module.exports = {
    run: async (client) => {
        console.log(chalk.red(`[RECONNECTED] ${client.user.tag} (${client.user.id})`))
    }
}
