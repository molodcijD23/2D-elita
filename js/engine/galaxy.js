import { G } from '../state.js';
import { Utils } from '../utils.js';
import { Asteroid } from '../entities/asteroid.js';

export const Galaxy = {
    generateGalaxy() {
        const names = ["Sol", "Alpha", "Sirius", "Vega", "Rigel", "Deneb", "Altair", "Procyon", "Tau Ceti", "Wolf"];
        for (let i = 0; i < 100; i++) {
            G.galaxy.push({
                id: i,
                name: i < names.length ? names[i] : "SYS-" + (1000 + i),
                x: Math.floor(Utils.seededRandom(i * 10) * 100) - 50,
                y: Math.floor(Utils.seededRandom(i * 20) * 100) - 50,
                seed: i * 1234.56,
                content: null
            });
        }
    },

    enterSystem(sys) {
        G.currentSystem = sys;
        if (!sys.content) {
            let seed = sys.seed;
            let content = {
                sun: { r: 80 + Utils.seededRandom(seed++) * 40, color: Utils.seededRandom(seed++) > 0.5 ? '#ffcc00' : '#ff4400' },
                planets: [],
                stations: [],
                stars: [],
                missions: [],
                asteroids: []
            };

            // Asteroids
            let aCount = 5 + Math.floor(Utils.seededRandom(seed++) * 10);
            for (let i = 0; i < aCount; i++) {
                content.asteroids.push(Asteroid.create());
            }

            // Planets
            let pCount = 2 + Math.floor(Utils.seededRandom(seed++) * 4);
            for (let i = 0; i < pCount; i++) {
                let type = Utils.seededRandom(seed++) > 0.6 ? 'Icy' : 'Rocky';
                content.planets.push({
                    x: (Utils.seededRandom(seed++) * 4000) - 2000,
                    y: (Utils.seededRandom(seed++) * 4000) - 2000,
                    r: 40 + Utils.seededRandom(seed++) * 50,
                    type: type,
                    color: type === 'Icy' ? '#00ccff' : '#884400',
                    name: sys.name + " " + (i + 1)
                });
            }

            // Stations
            let sCount = 1 + Math.floor(Utils.seededRandom(seed++) * 2);
            for (let i = 0; i < sCount; i++) {
                content.stations.push({
                    x: (Utils.seededRandom(seed++) * 2000) - 1000,
                    y: (Utils.seededRandom(seed++) * 2000) - 1000,
                    name: sys.name + " Hub " + String.fromCharCode(65 + i)
                });
            }

            // Missions
            for (let i = 0; i < 3; i++) {
                let targetId = Math.floor(Utils.seededRandom(seed++) * 100);
                content.missions.push({
                    id: Math.floor(Utils.seededRandom(seed++) * 99999),
                    targetId: targetId,
                    text: "Deliver Data to " + G.galaxy[targetId].name,
                    reward: 200 + Math.floor(Utils.seededRandom(seed++) * 500)
                });
            }

            for (let i = 0; i < 200; i++) {
                content.stars.push({
                    x: Utils.seededRandom(seed++) * 6000 - 3000,
                    y: Utils.seededRandom(seed++) * 6000 - 3000,
                    s: Utils.seededRandom(seed++) * 2
                });
            }
            sys.content = content;
        }
        document.getElementById('sys-name').innerText = sys.name;
    }
};
