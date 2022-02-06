const chalk = require('chalk')

module.exports = {
    run: async (client) => {
        console.log(chalk.red(`[ERROR] ${client.user.tag} (${client.user.id})`))
    }
}
