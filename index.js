require('module-alias/register')

const SleepingClient = require('./system')
const client = new SleepingClient()

client.connect()

module.exports = client
