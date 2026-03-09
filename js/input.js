import { G } from './state.js';

export const Input = {
    init() {
        window.addEventListener('keydown', e => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') G.input.w = true;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') G.input.s = true;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') G.input.a = true;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') G.input.d = true;
            if (e.code === 'Space') {
                if (!G.input.space) G.input.spacePressed = true;
                G.input.space = true;
            }
        });

        window.addEventListener('keyup', e => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') G.input.w = false;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') G.input.s = false;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') G.input.a = false;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') G.input.d = false;
            if (e.code === 'Space') G.input.space = false;
        });
    },
    clearSinglePresses() {
        G.input.spacePressed = false;
    }
};
