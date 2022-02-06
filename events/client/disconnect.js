const chalk = require('chalk')

module.exports = {
    run: async (client) => {
        console.log(chalk.red(`[DISCONNECTED] ${client.user.tag} (${client.user.id})`))
    }
}
