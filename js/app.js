import { G } from './state.js';
import { Input } from './input.js';
import { UI } from './ui.js';
import { Utils } from './utils.js';
import { Galaxy } from './engine/galaxy.js';
import { Ship } from './entities/ship.js';
import { Asteroid } from './entities/asteroid.js';

function init() {
    G.canvas = document.getElementById('gameCanvas');
    G.ctx = G.canvas.getContext('2d');
    
    window.addEventListener('resize', resize);
    resize();

    Input.init();
    UI.init();
    Galaxy.generateGalaxy();
    Galaxy.enterSystem(G.galaxy[0]); // Start at Sol

    loop();
}

function resize() {
    G.width = window.innerWidth;
    G.height = window.innerHeight;
    G.canvas.width = G.width;
    G.canvas.height = G.height;
}

function loop() {
    update();
    draw();
    Input.clearSinglePresses();
    requestAnimationFrame(loop);
}

function update() {
    if (G.state === 'JUMP_PREP') {
        G.jump.cursor += G.jump.speed * G.jump.dir;
        if (G.jump.cursor > 100 || G.jump.cursor < 0) G.jump.dir *= -1;
        
        if (G.input.spacePressed) {
            if (G.jump.cursor >= G.jump.zoneStart && G.jump.cursor <= (G.jump.zoneStart + G.jump.zoneWidth)) {
                Utils.notify("CALIBRATION SUCCESSFUL!", "#00ffcc");
                G.state = 'JUMPING';
            } else {
                Utils.notify("NAVIGATION ERROR!", "#ff3333");
                G.targetSystem = G.galaxy[Math.floor(Math.random() * 100)];
                G.state = 'JUMPING';
            }
        }
        return;
    }

    if (G.state === 'JUMPING') {
        G.jump.progress += 1.5;
        if (G.jump.progress >= 100) {
            Galaxy.enterSystem(G.targetSystem);
            G.ship.x = 0; G.ship.y = 500; G.ship.vx = 0; G.ship.vy = 0;
            G.state = 'FLYING';
        }
        return;
    }

    if (G.state === 'FLYING') {
        Ship.update();

        // Update Asteroids
        G.currentSystem.content.asteroids.forEach(a => {
            Asteroid.update(a);
            if (Utils.dist(G.ship.x, G.ship.y, a.x, a.y) < a.r + 10) {
                G.ship.hull -= 5;
                Utils.notify("HULL DAMAGE!", "red");
            }
        });

        // Check Docking
        G.currentSystem.content.stations.forEach(s => {
            if (Utils.dist(G.ship.x, G.ship.y, s.x, s.y) < 50) {
                if (Math.sqrt(G.ship.vx**2 + G.ship.vy**2) < 2.0) {
                    dock(s);
                }
            }
        });

        // Mining
        G.currentSystem.content.planets.forEach(p => {
            if (Utils.dist(G.ship.x, G.ship.y, p.x, p.y) < p.r + 120 && G.ship.laser && G.input.space) {
                let res = p.type === 'Icy' ? 'Crystals' : 'Ore';
                const totalCargo = G.ship.cargo.Food + G.ship.cargo.Ore + G.ship.cargo.Crystals;
                if (Math.random() < 0.02 && totalCargo < G.ship.capacity) {
                    G.ship.cargo[res]++;
                    Utils.notify("+1 " + res.toUpperCase(), p.color);
                }
            }
        });
    }

    UI.updateHUD();
}

function dock(station) {
    G.state = 'DOCKED';
    G.currentStation = station;
    G.ship.vx = 0; G.ship.vy = 0;
    
    // Check mission completion
    let completed = [];
    G.ship.activeMissions = G.ship.activeMissions.filter(m => {
        if (G.galaxy[m.targetId].name === G.currentSystem.name) {
            completed.push(m);
            G.ship.credits += m.reward;
            return false;
        }
        return true;
    });

    if (completed.length > 0) {
        Utils.notify("MISSIONS COMPLETED! +" + completed.reduce((a,b)=>a+b.reward, 0) + " CR", "lime");
    }

    UI.openStation();
}

function draw() {
    const ctx = G.ctx;
    ctx.clearRect(0, 0, G.width, G.height);

    if (G.state === 'JUMP_PREP') {
        drawMinigame(ctx);
        return;
    }

    if (G.state === 'JUMPING') {
        ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 2;
        for (let i = 0; i < 60; i++) {
            let a = (i/60)*Math.PI*2; let r = (G.jump.progress*25 + i*15)%1500;
            ctx.beginPath(); ctx.moveTo(G.width/2+Math.cos(a)*r, G.height/2+Math.sin(a)*r);
            ctx.lineTo(G.width/2+Math.cos(a)*(r+150), G.height/2+Math.sin(a)*(r+150)); ctx.stroke();
        }
        return;
    }

    ctx.save();
    
    // Parallax background
    const layers = [
        { speed: 0.2, color: '#111', size: 1 },
        { speed: 0.5, color: '#333', size: 2 },
        { speed: 0.8, color: '#555', size: 2.5 }
    ];
    
    layers.forEach(layer => {
        ctx.fillStyle = layer.color;
        const parallaxX = G.ship.x * layer.speed;
        const parallaxY = G.ship.y * layer.speed;
        
        ctx.save();
        ctx.translate(-parallaxX, -parallaxY);
        
        G.currentSystem.content.stars.forEach(s => {
            ctx.fillRect(s.x, s.y, layer.size, layer.size);
        });
        
        ctx.restore();
    });

    ctx.translate(G.width/2 - G.ship.x, G.height/2 - G.ship.y);

    const c = G.currentSystem.content;

    // Sun
    const grad = ctx.createRadialGradient(0, 0, c.sun.r * 0.5, 0, 0, c.sun.r * 1.5);
    grad.addColorStop(0, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.2, c.sun.color);
    grad.addColorStop(1, 'rgba(255,165,0,0)');
    
    ctx.beginPath();
    ctx.arc(0, 0, c.sun.r * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Planets
    c.planets.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Rings
        if (p.type === 'Icy') {
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.r * 1.5, p.r * 0.5, Math.PI / 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = '#000';
        ctx.fillText(p.name, p.x-20, p.y-p.r-10);
    });

    // Stations
    c.stations.forEach(s => {
        ctx.strokeStyle = '#f0f';
        ctx.lineWidth = 3;
        ctx.strokeRect(s.x-25, s.y-25, 50, 50);
        ctx.fillStyle = '#000';
        ctx.fillText(s.name, s.x-30, s.y-40);
    });

    // Asteroids
    c.asteroids.forEach(a => {
        Asteroid.draw(ctx, a);
    });

    // Laser
    if (G.input.space && G.ship.laser && G.state === 'FLYING') {
        c.planets.forEach(p => {
            if (Utils.dist(G.ship.x, G.ship.y, p.x, p.y) < p.r + 120) {
                ctx.beginPath();
                ctx.moveTo(G.ship.x, G.ship.y);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = p.type === 'Icy' ? '#0cf' : '#fc0';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        });
    }

    Ship.draw(ctx);
    ctx.restore();
}

function drawMinigame(ctx) {
    const cx = G.width/2, cy = G.height/2;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(0,0, G.width, G.height);
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("HYPERSPACE CALIBRATION", cx, cy - 60);
    const w = 400, h = 30;
    ctx.strokeStyle = "#000";
    ctx.strokeRect(cx - w/2, cy, w, h);
    const zx = (G.jump.zoneStart / 100) * w, zw = (G.jump.zoneWidth / 100) * w;
    ctx.fillStyle = "#0f0";
    ctx.fillRect((cx - w/2) + zx, cy + 2, zw, h - 4);
    const curX = (G.jump.cursor / 100) * w;
    ctx.fillStyle = "#f00";
    ctx.fillRect((cx - w/2) + curX - 2, cy - 5, 4, h + 10);
}

window.onload = init;
