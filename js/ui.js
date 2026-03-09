import { G } from './state.js';
import { Utils } from './utils.js';
import { Galaxy } from './engine/galaxy.js';

export const UI = {
    init() {
        document.getElementById('jump-btn').onclick = UI.openNav;
        document.getElementById('btn-market').onclick = () => UI.renderStation('market');
        document.getElementById('btn-missions').onclick = () => UI.renderStation('missions');
        document.getElementById('btn-outfit').onclick = () => UI.renderStation('outfit');
        document.getElementById('undock-btn').onclick = UI.undock;
        document.getElementById('close-nav-btn').onclick = UI.closeNav;
    },

    updateHUD() {
        document.getElementById('cr').innerText = G.ship.credits;
        document.getElementById('hl').innerText = Math.floor(G.ship.hull);
        document.getElementById('fl').innerText = Math.floor(G.ship.fuel);
        document.getElementById('fl-bar').style.width = G.ship.fuel + "%";
        
        const totalCargo = G.ship.cargo.Food + G.ship.cargo.Ore + G.ship.cargo.Crystals;
        document.getElementById('cg').innerText = totalCargo + "/" + G.ship.capacity;
    },

    openStation() {
        document.getElementById('st-title').innerText = G.currentStation.name;
        document.getElementById('station-modal').style.display = 'block';
        UI.renderStation('market');
    },

    undock() {
        G.state = 'FLYING';
        document.getElementById('station-modal').style.display = 'none';
        G.ship.y += 120;
    },

    renderStation(tab) {
        let html = '';
        ['btn-market', 'btn-missions', 'btn-outfit'].forEach(id => {
            document.getElementById(id).classList.toggle('active', id.includes(tab));
        });

        if (tab === 'market') {
            html += `<div class="row"><span><b>Fuel Supply (10 CR/unit)</b></span><div>
                <button id="refuel-10">+10%</button><button id="refuel-max">MAX</button></div></div>`;
            html += `<div class="row"><span>Food (20 CR) [Own: ${G.ship.cargo.Food}]</span><div><button id="sell-food">S</button><button id="buy-food">B</button></div></div>`;
            html += `<div class="row"><span>Ore (Sell: 80 CR) [Own: ${G.ship.cargo.Ore}]</span><button id="sell-ore">SELL ALL</button></div>`;
            html += `<div class="row"><span>Crystals (Sell: 150 CR) [Own: ${G.ship.cargo.Crystals}]</span><button id="sell-cry">SELL ALL</button></div>`;
        } else if (tab === 'missions') {
            G.currentSystem.content.missions.forEach(m => {
                html += `<div class="row"><div><b>${m.text}</b><br>Reward: ${m.reward} CR</div><button id="accept-${m.id}">ACCEPT</button></div>`;
            });
        } else if (tab === 'outfit') {
            html += `<div class="row"><span>Mining Laser (500 CR)</span><button id="buy-laser">${G.ship.laser ? 'OWNED' : 'BUY'}</button></div>`;
            html += `<div class="row"><span>Cargo Ext. (800 CR)</span><button id="buy-cargo">+5 CAP</button></div>`;
        }
        
        const body = document.getElementById('modal-body');
        body.innerHTML = html;

        // Re-bind events because we used innerHTML
        if (tab === 'market') {
            document.getElementById('refuel-10').onclick = () => UI.handleRefuel(10);
            document.getElementById('refuel-max').onclick = () => UI.handleRefuel(100);
            document.getElementById('sell-food').onclick = () => UI.handleTrade('Food', -1);
            document.getElementById('buy-food').onclick = () => UI.handleTrade('Food', 1);
            document.getElementById('sell-ore').onclick = () => UI.handleTrade('Ore', -1);
            document.getElementById('sell-cry').onclick = () => UI.handleTrade('Crystals', -1);
        } else if (tab === 'missions') {
            G.currentSystem.content.missions.forEach(m => {
                document.getElementById(`accept-${m.id}`).onclick = () => UI.acceptMission(m.id);
            });
        } else if (tab === 'outfit') {
            document.getElementById('buy-laser').onclick = () => UI.buyItem('laser');
            document.getElementById('buy-cargo').onclick = () => UI.buyItem('cargo');
        }
    },

    handleRefuel(amt) {
        let needed = Math.min(amt, 100 - G.ship.fuel);
        let cost = Math.ceil(needed * 10);
        if (G.ship.credits >= cost) {
            G.ship.credits -= cost;
            G.ship.fuel += needed;
            UI.renderStation('market');
        } else {
            Utils.notify("INSUFFICIENT CREDITS", "red");
        }
    },

    handleTrade(item, amt) {
        const totalCargo = G.ship.cargo.Food + G.ship.cargo.Ore + G.ship.cargo.Crystals;
        if (item === 'Food') {
            if (amt > 0 && G.ship.credits >= 20 && totalCargo < G.ship.capacity) {
                G.ship.credits -= 20; G.ship.cargo.Food++;
            } else if (amt < 0 && G.ship.cargo.Food > 0) {
                G.ship.credits += 20; G.ship.cargo.Food--;
            }
        } else {
            if (amt < 0) {
                let price = item === 'Ore' ? 80 : 150;
                G.ship.credits += G.ship.cargo[item] * price;
                G.ship.cargo[item] = 0;
            }
        }
        UI.renderStation('market');
    },

    acceptMission(id) {
        let idx = G.currentSystem.content.missions.findIndex(m => m.id === id);
        if (idx > -1) {
            G.ship.activeMissions.push(G.currentSystem.content.missions[idx]);
            G.currentSystem.content.missions.splice(idx, 1);
            Utils.notify("MISSION ACCEPTED", "yellow");
            UI.renderStation('missions');
        }
    },

    buyItem(type) {
        if (type === 'laser' && !G.ship.laser && G.ship.credits >= 500) {
            G.ship.credits -= 500; G.ship.laser = true;
        } else if (type === 'cargo' && G.ship.credits >= 800) {
            G.ship.credits -= 800; G.ship.capacity += 5;
        }
        UI.renderStation('outfit');
    },

    openNav() {
        if (G.state !== 'FLYING') return;
        document.getElementById('nav-modal').style.display = 'block';
        let html = '';
        const list = G.galaxy.map(s => ({
            ...s,
            d: Math.sqrt((s.x - G.currentSystem.x) ** 2 + (s.y - G.currentSystem.y) ** 2)
        })).sort((a, b) => a.d - b.d);

        list.forEach(sys => {
            if (sys.id === G.currentSystem.id) return;
            let cost = Math.floor(sys.d * 1.5);
            html += `<div class="row"><span>${sys.name} (${sys.d.toFixed(1)} LY)</span>
                <button id="jump-${sys.id}" ${G.ship.fuel < cost ? 'disabled' : ''}>JUMP (${cost} F)</button></div>`;
        });
        
        const body = document.getElementById('nav-body');
        body.innerHTML = html;

        list.forEach(sys => {
            if (sys.id !== G.currentSystem.id) {
                let cost = Math.floor(sys.d * 1.5);
                const btn = document.getElementById(`jump-${sys.id}`);
                if (btn) btn.onclick = () => UI.prepJump(sys.id, cost);
            }
        });
    },

    closeNav: () => document.getElementById('nav-modal').style.display = 'none',

    prepJump(id, cost) {
        G.targetSystem = G.galaxy.find(s => s.id === id);
        G.ship.fuel -= cost;
        UI.closeNav();
        G.state = 'JUMP_PREP';
        G.jump.progress = 0;
        G.jump.cursor = 0;
        G.jump.speed = 2 + Math.random() * 2;
        G.jump.zoneStart = 20 + Math.random() * 50;
        G.jump.zoneWidth = 15;
    }
};
