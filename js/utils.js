export const Utils = {
    seededRandom: (seed) => {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    },
    dist: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    notify: (text, color = '#fff') => {
        const m = document.getElementById('msg');
        m.innerText = text;
        m.style.color = color;
        setTimeout(() => { if (m.innerText === text) m.innerText = ''; }, 3000);
    }
};
