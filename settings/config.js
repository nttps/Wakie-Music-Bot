require('dotenv').config()

module.exports = {
    TOKEN: process.env.TOKEN || 'OTA0ODQ2NjQyNTA5OTEwMTE2.YYBeGg.lLAW5UTh88HCgPRqx19jBz6zorg', // your bot token
    PREFIX: process.env.PREFIX || '!', //<= default is #  // bot prefix

    OWNER_ID: process.env.OWNER_ID || '212892916081885186', //your client id

    NP_REALTIME: process.env.NP_REALTIME || false, // "true" = realtime, "false" = not realtime :3 // WARNING: on set to "true" = laggy

    DEV_ID: [], // if you want to use command bot only, you can put your id here // example: ["515490955801919488", "543595284345782296"]

    LIMIT_TRACK: process.env.LIMIT_TRACK || '100', //<= dafault is "100" // limit track in playlist
    LIMIT_PLAYLIST: process.env.LIMIT_PLAYLIST || '10', //<= default is "10" // limit can create playlist

    NODES: [
        {
            host: process.env.NODE_HOST || 'localhost',
            port: parseInt(process.env.NODE_PORT || '2333'),
            password: process.env.NODE_PASSWORD || 'Team2234_'
        }
    ],
    PRESENCE: {
        activities: [
            {
                name: 'FOR WAKIAN',
                type: 'PLAYING'
            }
        ],
        status: 'online'
    },
    spotify: {
        clientID: 'e007c74142f1451c97a015df7846c6e7',
        clientSecret: '2f5a58028dfd4d98930b55670f631fda'
    },
    PLAYER: 'DISTUBE', // DISTUBE , MANAGER
    LOGO: 'https://i.imgur.com/i2hBVhA.jpeg'
}
