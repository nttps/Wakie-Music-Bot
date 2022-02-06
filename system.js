const { Client, Intents, Collection } = require('discord.js')
const { Manager } = require('erela.js')
const spotify = require('erela.js-spotify')
const deezer = require('erela.js-deezer')
const apple = require('erela.js-apple')
const facebook = require('erela.js-facebook')
const { DisTube } = require('distube')
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { YtDlpPlugin } = require('@distube/yt-dlp')
const { readdirSync } = require('fs')
const path = require('path')
const filters = require('@settings/filter')
const CONFIG = require('@settings/config')

class SystemClient extends Client {
    constructor() {
        super({
            fetchAllMembers: false,
            failIfNotExists: false,
            shards: 'auto',
            allowedMentions: {
                parse: ['roles', 'users', 'everyone'],
                repliedUser: false
            },
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_INTEGRATIONS],
            presence: CONFIG.PRESENCE
        })

        this.config = require('@settings/config.js')
        this.loadslash = [] // for slash commands
        this.prefix = this.config.PREFIX
        this.owner = this.config.OWNER_ID
        this.dev = this.config.DEV_ID

        const clientID = this.config.spotify.clientID
        const clientSecret = this.config.spotify.clientSecret

        if (!this.token) this.token = this.config.TOKEN

        process.on('unhandledRejection', (error) => console.log(error))
        process.on('uncaughtException', (error) => console.log(error))

        const client = this

        this.manager = new Manager({
            nodes: this.config.NODES,
            plugins: [
                new spotify({
                    clientID, //get a clientID from there: https://developer.spotify.com/dashboard
                    clientSecret
                }),
                new deezer(),
                new apple(),
                new facebook()
            ],
            send(id, payload) {
                const guild = client.guilds.cache.get(id)
                if (guild) guild.shard.send(payload)
            }
        })

        this.distube = new DisTube(client, {
            emitNewSongOnly: false,
            leaveOnEmpty: true,
            leaveOnStop: true,
            savePreviousSongs: true,
            emitAddSongWhenCreatingQueue: false,
            //emitAddListWhenCreatingQueue: false,
            searchSongs: 0,
            youtubeCookie:
                'VISITOR_INFO1_LIVE=BkjTUVkVS-g; CONSENT=YES+TH.th+20170108-18-0; _ga=GA1.2.457438476.1615318064; LOGIN_INFO=AFmmF2swRAIgFfEXJfa3R-cYCirhDlPJyfSI2b0H_DkLlQk6Euk2nVECIEzQwYeLjmSzLfwKcszU6y-2uFeBUlmRYkjFQs9AeUzo:QUQ3MjNmeXlUZDNQQmt4Q3RZOEVkdHdjMkJaRVFCbUZtbnNKWTdrTHdTRV8yaUNnUUIzeFVadWZMSURjbk0ycGJ1dDgxTHQxRk04ZVY3dldfeTE2RndxS1FZV1VqMTVkcE5tMjhicl9CYXJIRlBYTzZpMXhhWG10RkRxME5GbDNBQmRpZEN0LVVwTEIzTW40OTJfTjQtTHBYbjZwN2Zibms1YmllVUdHQ0Vxako2cW5kaUFlUzVF; HSID=AdR91sOwd9lnSFRJD; SSID=A4-BLY2FOhXAPovwd; APISID=COk5TRza_khfPwnH/AK1resDbUATyJ30Sj; SAPISID=87tcIhZm04kEIXPF/AoeO1WmQSZhmk-8Ws; __Secure-1PAPISID=87tcIhZm04kEIXPF/AoeO1WmQSZhmk-8Ws; __Secure-3PAPISID=87tcIhZm04kEIXPF/AoeO1WmQSZhmk-8Ws; YSC=Fd4yazHC3Zc; SID=DQiHAbyUCEMaaO_6sLplf8nI6o07E2tcQ-IhINaOKOPPrCAnd0Qi0z62GNH7Fttxjqu-_A.; __Secure-1PSID=DQiHAbyUCEMaaO_6sLplf8nI6o07E2tcQ-IhINaOKOPPrCAn3_PjqZ4bQZWEfnrniECtJA.; __Secure-3PSID=DQiHAbyUCEMaaO_6sLplf8nI6o07E2tcQ-IhINaOKOPPrCAnilcrt46EOSKpbsIB_UmWSg.; PREF=f6=40000480&volume=100&tz=Asia.Bangkok&al=th&f5=20000&f4=4000000; SIDCC=AJi4QfHUkloVyBh8d_EjAsfT00VX59Uk30Gytxiihu2_CiTT8J8K_dbAwcpYJlAdcKAvTOhSSE0; __Secure-3PSIDCC=AJi4QfF5pPlYi8vUs9lz8BtVISRFDlHZELpJD9P4dD9h_QaQyR_bpqe12MbvsmqD2O4qQbRZfDw', //Comment this line if you dont want to use a youtube Cookie
            nsfw: true, //Set it to false if u want to disable nsfw songs
            emptyCooldown: 25,
            ytdlOptions: {
                //requestOptions: {
                //  agent //ONLY USE ONE IF YOU KNOW WHAT YOU DO!
                //},
                highWaterMark: 1 << 24,
                filter: 'audioonly',
                quality: 'highestaudio',
                format: 'audioonly',
                liveBuffer: 60000,
                dlChunkSize: 1024 * 1024 * 64
            },
            youtubeDL: false,
            updateYouTubeDL: true,
            customFilters: filters.DISTUBE,
            plugins: [
                new SpotifyPlugin({
                    emitEventsAfterFetching: true,
                    api: {
                        clientId: clientID,
                        clientSecret: clientSecret
                    }
                }),
                new SoundCloudPlugin(),
                new YtDlpPlugin()
            ]
        })
        ;['aliases', 'slashCommands', 'commands', 'cooldowns'].forEach((x) => (client[x] = new Collection())) // register variable collection
        ;['playercreated', 'playerintervals', 'playerintervals_autoresume'].forEach((x) => (client[x] = new Map())) // register variable map
        ;['loadDatabase', 'loadCommand', 'loadSlashCommand', 'loadEvent', 'loadPlayer', 'loadDistube'].forEach((x) => require(`./handlers/${x}`)(client))

        readdirSync('./slashcommands/').map(async (dir) => {
            readdirSync(`./slashcommands/${dir}`).map(async (cmd) => {
                this.loadslash.push(require(path.join(__dirname, `./slashcommands/${dir}/${cmd}`)))
            })
        })

        /* The client.langs object is a dictionary of all the languages in the languages folder.
      
      The for loop iterates through the langs array, which is an array of all the files in the
      languages folder.
      
      The filter method filters out all the files that don't end with .json.
      
      The for loop then iterates through the filtered array, which is an array of all the .json
      files in the languages folder.
      
      The for loop then adds the language name to the client.langs object, which is a dictionary.
      
      The require method is used */
        this.langs = {}
        const langs = readdirSync('./languages')
        for (const lang of langs.filter((file) => file.endsWith('.json'))) {
            this.langs[`${lang.split('.json').join('')}`] = require(`./languages/${lang}`)
        }
        Object.freeze(this.langs)
    }

    /**
     * Connect to the server using the token
     * @returns The `connect` method returns a promise.
     */
    connect() {
        return super.login(this.token)
    }
}

/* Creating a new class called SystemClient. */
module.exports = SystemClient
