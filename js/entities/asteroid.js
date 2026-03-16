import { G } from '../state.js';
import { Utils } from '../utils.js';

export const Asteroid = {
    create() {
        const angle = Math.random() * Math.PI * 2;
        const dist = 1000 + Math.random() * 1500;
        return {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            r: 20 + Math.random() * 30,
            sides: 6 + Math.floor(Math.random() * 5),
            angle: 0,
            rotSpeed: (Math.random() - 0.5) * 0.02
        };
    },

    update(a) {
        a.x += a.vx;
        a.y += a.vy;
        a.angle += a.rotSpeed;

        // Screen wrap
        if (a.x < -G.width / 2) a.x = G.width / 2;
        if (a.x > G.width / 2) a.x = -G.width / 2;
        if (a.y < -G.height / 2) a.y = G.height / 2;
        if (a.y > G.height / 2) a.y = -G.height / 2;
    },

    draw(ctx, a) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);
        ctx.beginPath();
        ctx.moveTo(a.r, 0);
        for (let i = 1; i <= a.sides; i++) {
            const angle = (i / a.sides) * Math.PI * 2;
            ctx.lineTo(Math.cos(angle) * a.r, Math.sin(angle) * a.r);
        }
        ctx.closePath();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
};
