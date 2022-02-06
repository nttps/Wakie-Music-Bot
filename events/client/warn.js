const chalk = require('chalk')

module.exports = {
    run: async (client) => {
        console.log(chalk.yellowBright(`[WARN] ${client.user.tag} (${client.user.id})`))
    }
}
