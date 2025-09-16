// Создаем капли дождя
export function createDrops() {
    drops = [];
    for (let i = 0; i < maxDrops; i++) {
        let instance = new Droplet(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            randVal(dropLengths),
            randVal(dropSkews)
        );
        drops.push(instance);
    }
}

export function randVal(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function animateRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let drop of drops) {
        drop.move();
        drop.draw(ctx);
    }

    animationId = requestAnimationFrame(animateRain);
}

// Управление видимостью дождя
export function toggleRainVisibility(visible) {
    if (visible) {
        canvas.style.display = 'block';
        resizeCanvas();
        createDrops();
        if (animationId) cancelAnimationFrame(animationId);
        animateRain();
    } else {
        canvas.style.display = 'none';
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
}