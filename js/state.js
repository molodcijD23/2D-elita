export const G = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    state: 'FLYING', // FLYING, DOCKED, JUMP_PREP, JUMPING
    input: {
        w: false,
        s: false,
        a: false,
        d:false,
        space: false,
        spacePressed: false
    },
    ship: {
        x: 400,
        y: 400,
        vx: 0,
        vy: 0,
        angle: -1.5,
        credits: 1000,
        hull: 100,
        fuel: 100,
        cargo: { Food: 0, Ore: 0, Crystals: 0 },
        capacity: 12,
        laser: false,
        activeMissions: []
    },
    galaxy: [],
    currentSystem: null,
    targetSystem: null,
    currentStation: null,
    jump: {
        progress: 0,
        cursor: 0,
        speed: 3,
        zoneStart: 0,
        zoneWidth: 20,
        dir: 1
    }
};
