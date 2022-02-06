module.exports = {
    run: async (client, data) => {
        client.manager?.updateVoiceState(data)
    }
}
