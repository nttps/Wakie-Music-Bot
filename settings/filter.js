module.exports = {
    DISTUBE: {
        clear: 'dynaudnorm=f=200',
        lightbass: 'bass=g=8,dynaudnorm=f=200',
        heavybass: 'bass=g=20,dynaudnorm=f=200',
        bassboost: 'bass=g=8,dynaudnorm=f=200',
        custombassboost: 'bass=g=1,dynaudnorm=f=200',
        customspeed: 'atempo=1.0',
        purebass: 'bass=g=20,dynaudnorm=f=200,asubboost',
        '8d': 'apulsator=hz=0.08',
        vaporwave: 'aresample=48000,asetrate=48000*0.8',
        nightcore: 'aresample=48000,asetrate=48000*1.25',
        phaser: 'aphaser=in_gain=0.4',
        tremolo: 'tremolo',
        vibrato: 'vibrato=f=6.5',
        reverse: 'areverse',
        treble: 'treble=g=5',
        surrounding: 'surround',
        pulsator: 'apulsator=hz=1',
        subboost: 'asubboost',
        karaoke: 'stereotools=mlev=0.03',
        flanger: 'flanger',
        gate: 'agate',
        haas: 'haas',
        mcompand: 'mcompand',
        earrape: 'bass=g=50',
        bassboost1: 'bass=g=1,dynaudnorm=f=200',
        bassboost2: 'bass=g=2,dynaudnorm=f=200',
        bassboost3: 'bass=g=3,dynaudnorm=f=200',
        bassboost4: 'bass=g=4,dynaudnorm=f=200',
        bassboost5: 'bass=g=5,dynaudnorm=f=200',
        bassboost6: 'bass=g=6,dynaudnorm=f=200',
        bassboost7: 'bass=g=7,dynaudnorm=f=200',
        bassboost8: 'bass=g=8,dynaudnorm=f=200',
        bassboost9: 'bass=g=9,dynaudnorm=f=200',
        bassboost10: 'bass=g=10,dynaudnorm=f=200',
        bassboost11: 'bass=g=11,dynaudnorm=f=200',
        bassboost12: 'bass=g=12,dynaudnorm=f=200',
        bassboost13: 'bass=g=13,dynaudnorm=f=200',
        bassboost14: 'bass=g=17,dynaudnorm=f=200',
        bassboost15: 'bass=g=15,dynaudnorm=f=200',
        bassboost16: 'bass=g=16,dynaudnorm=f=200',
        bassboost17: 'bass=g=17,dynaudnorm=f=200',
        bassboost18: 'bass=g=18,dynaudnorm=f=200',
        bassboost19: 'bass=g=19,dynaudnorm=f=200',
        bassboost20: 'bass=g=20,dynaudnorm=f=200'
    },
    PLAYER: {
        reset: {},
        bass: {
            equalizer: [
                { band: 0, gain: 0.6 },
                { band: 1, gain: 0.67 },
                { band: 2, gain: 0.67 },
                { band: 3, gain: 0 },
                { band: 4, gain: -0.5 },
                { band: 5, gain: 0.15 },
                { band: 6, gain: -0.45 },
                { band: 7, gain: 0.23 },
                { band: 8, gain: 0.35 },
                { band: 9, gain: 0.45 },
                { band: 10, gain: 0.55 },
                { band: 11, gain: 0.6 },
                { band: 12, gain: 0.55 },
                { band: 13, gain: 0 }
            ]
        },
        pop: {
            equalizer: [
                { band: 0, gain: 0.65 },
                { band: 1, gain: 0.45 },
                { band: 2, gain: -0.45 },
                { band: 3, gain: -0.65 },
                { band: 4, gain: -0.35 },
                { band: 5, gain: 0.45 },
                { band: 6, gain: 0.55 },
                { band: 7, gain: 0.6 },
                { band: 8, gain: 0.6 },
                { band: 9, gain: 0.6 },
                { band: 10, gain: 0 },
                { band: 11, gain: 0 },
                { band: 12, gain: 0 },
                { band: 13, gain: 0 }
            ]
        },
        soft: {
            equalizer: [
                { band: 0, gain: 0 },
                { band: 1, gain: 0 },
                { band: 2, gain: 0 },
                { band: 3, gain: 0 },
                { band: 4, gain: 0 },
                { band: 5, gain: 0 },
                { band: 6, gain: 0 },
                { band: 7, gain: 0 },
                { band: 8, gain: -0.25 },
                { band: 9, gain: -0.25 },
                { band: 10, gain: -0.25 },
                { band: 11, gain: -0.25 },
                { band: 12, gain: -0.25 },
                { band: 13, gain: -0.25 }
            ]
        },
        treblebass: {
            equalizer: [
                { band: 0, gain: 0.6 },
                { band: 1, gain: 0.67 },
                { band: 2, gain: 0.67 },
                { band: 3, gain: 0 },
                { band: 4, gain: -0.5 },
                { band: 5, gain: 0.15 },
                { band: 6, gain: -0.45 },
                { band: 7, gain: 0.23 },
                { band: 8, gain: 0.35 },
                { band: 9, gain: 0.45 },
                { band: 10, gain: 0.55 },
                { band: 11, gain: 0.6 },
                { band: 12, gain: 0.55 },
                { band: 13, gain: 0 }
            ]
        },
        superbass: {
            equalizer: [
                { band: 0, gain: 0.2 },
                { band: 1, gain: 0.3 },
                { band: 2, gain: 0 },
                { band: 3, gain: 0.8 },
                { band: 4, gain: 0 },
                { band: 5, gain: 0.5 },
                { band: 6, gain: 0 },
                { band: 7, gain: -0.5 },
                { band: 8, gain: 0 },
                { band: 9, gain: 0 },
                { band: 10, gain: 0 },
                { band: 11, gain: 0 },
                { band: 12, gain: 0 },
                { band: 13, gain: 0 }
            ]
        },
        nightcore: {
            timescale: {
                speed: 1.165,
                pitch: 1.125,
                rate: 1.05
            }
        },
        doubletime: {
            timescale: {
                speed: 1.165
            }
        },
        vaporwave: {
            equalizer: [
                { band: 1, gain: 0.3 },
                { band: 0, gain: 0.3 }
            ],
            timescale: { pitch: 0.5 },
            tremolo: { depth: 0.3, frequency: 14 }
        },
        china: {
            timescale: {
                speed: 0.75,
                pitch: 1.25,
                rate: 1.25
            }
        },
        threed: {
            rotation: {
                rotationHz: 0.2
            }
        },
        dance: {
            timescale: {
                speed: 1.25,
                pitch: 1.25,
                rate: 1.25
            }
        },
        slowmotion: {
            timescale: {
                speed: 0.5,
                pitch: 1.0,
                rate: 0.8
            }
        },
        chipmunk: {
            timescale: {
                speed: 1.05,
                pitch: 1.35,
                rate: 1.25
            }
        },
        darthvader: {
            timescale: {
                speed: 0.975,
                pitch: 0.5,
                rate: 0.8
            }
        },
        vibrate: {
            vibrato: {
                frequency: 4.0,
                depth: 0.75
            },
            tremolo: {
                frequency: 4.0,
                depth: 0.75
            }
        },
        vibrato: {
            vibrato: {
                frequency: 4.0,
                depth: 0.75
            }
        },
        tremolo: {
            tremolo: {
                frequency: 4.0,
                depth: 0.75
            }
        }
    }
}
