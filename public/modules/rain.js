// Переменные модуля
let drops = [];
let maxDrops = 100;
let canvas, ctx;
let dropLengths = [10, 15, 20, 25];
let dropSkews = [0.1, 0.2, 0.3];
let animationId = null;

// Класс капли дождя
class Droplet {
    constructor(x, y, length, skew) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.skew = skew;
        this.speed = Math.random() * 3 + 1;
    }

    move() {
        this.y += this.speed;
        this.x += this.skew;
        
        if (this.y > canvas.height) {
            this.y = -this.length;
            this.x = Math.random() * canvas.width;
        }
        if (this.x > canvas.width) {
            this.x = 0;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.skew, this.y + this.length);
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// Инициализация canvas
export function initRain(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    resizeCanvas();
}

// Изменение размера canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

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