import { G } from '../state.js';

export class Ship {
    static update() {
        if (G.state !== 'FLYING') return;

        const thrust = 0.16;
        const turnSpeed = 0.06;
        const fuelConsumption = 0.01;

        // Rotation
        if (G.input.a) G.ship.angle -= turnSpeed;
        if (G.input.d) G.ship.angle += turnSpeed;

        // Forward Thrust
        if (G.input.w && G.ship.fuel > 0) {
            G.ship.vx += Math.cos(G.ship.angle) * thrust;
            G.ship.vy += Math.sin(G.ship.angle) * thrust;
            G.ship.fuel -= fuelConsumption;
        }

        // --- REVERSE THRUST (Braking) ---
        if (G.input.s && G.ship.fuel > 0) {
            // Apply force in exact opposite direction of current angle
            // or simply decelerate existing velocity vectors
            const brakeForce = 0.10; // Slightly weaker than forward thrust
            G.ship.vx -= Math.cos(G.ship.angle) * brakeForce;
            G.ship.vy -= Math.sin(G.ship.angle) * brakeForce;
            G.ship.fuel -= fuelConsumption * 0.5;
            
            // Additional passive damping when braking
            G.ship.vx *= 0.96;
            G.ship.vy *= 0.96;
        }

        // Apply Position
        G.ship.x += G.ship.vx;
        G.ship.y += G.ship.vy;

        // Friction / Drag
        G.ship.vx *= 0.99;
        G.ship.vy *= 0.99;
    }

    static draw(ctx) {
        ctx.save();
        ctx.translate(G.ship.x, G.ship.y);
        ctx.rotate(G.ship.angle);

        // Ship Body
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, 10);
        ctx.lineTo(-10, -10);
        ctx.closePath();
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        ctx.stroke();

        // --- Visual Effects (Thrusters) ---
        
        // Main Engine (Back)
        if (G.input.w && G.state === 'FLYING' && G.ship.fuel > 0) {
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(-25, 0);
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Reverse Thrusters (Front/Sides)
        if (G.input.s && G.state === 'FLYING' && G.ship.fuel > 0) {
            // Left Reverse
            ctx.beginPath();
            ctx.moveTo(8, 8);
            ctx.lineTo(15, 12);
            // Right Reverse
            ctx.moveTo(8, -8);
            ctx.lineTo(15, -12);
            ctx.strokeStyle = '#00ccff'; // Blueish for cold gas/reverse thrusters
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
    }
}
