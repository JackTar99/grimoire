const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const invaderImage = new Image();
const defenderImage = new Image();
const missileImage = new Image();
const bombImage = new Image();
invaderImage.src = 'invader.png';
defenderImage.src = 'defender.png';
missileImage.src = 'missile.png';
bombImage.src = 'bomb.png';

const invaders = [];
const missiles = [];
const bombs = [];
let defender;
let gameOver = false;
let score = 0;
let totalInvadersCreated = 0;
let gameInterval;
const maxInvaders = 20;
const framesPerSecond = 15;

class Invader {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speedX = 2.8; // Increased by 40%
        this.direction = 'right';
    }

    draw() {
        ctx.drawImage(invaderImage, this.x, this.y, this.width, this.height);
    }

    move() {
        if (this.direction === 'right') {
            this.x += this.speedX;
            if (this.x + this.width >= canvasWidth) {
                this.direction = 'left';
                this.y += 100;
                this.x -= 5;
            }
        } else {
            this.x -= this.speedX;
            if (this.x <= 0) {
                this.direction = 'right';
                this.y += 100;
                this.x += 5;
            }
        }
    }

    dropBomb() {
        if (Math.random() < 0.028 && bombs.filter(b => b.invader === this).length < 2) { // Increased probability by 40%
            bombs.push(new Bomb(this.x + this.width / 2, this.y + this.height, this));
        }
    }
}

class Defender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speedX = 10;
    }

    draw() {
        ctx.drawImage(defenderImage, this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speedX;
        } else if (direction === 'right' && this.x + this.width < canvasWidth) {
            this.x += this.speedX;
        }
    }
}

class Missile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 20;
        this.speedY = 5;
    }

    draw() {
        ctx.drawImage(missileImage, this.x, this.y, this.width, this.height);
    }

    move() {
        this.y -= this.speedY;
    }

    hit(invader) {
        return this.x < invader.x + invader.width &&
               this.x + this.width > invader.x &&
               this.y < invader.y + invader.height &&
               this.y + this.height > invader.y;
    }
}

class Bomb {
    constructor(x, y, invader) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speedY = 4.2; // Increased by 40%
        this.invader = invader;
    }

    draw() {
        ctx.drawImage(bombImage, this.x, this.y, this.width, this.height);
    }

    move() {
        this.y += this.speedY;
    }

    hit(defender) {
        return this.x < defender.x + defender.width &&
               this.x + this.width > defender.x &&
               this.y < defender.y + defender.height &&
               this.y + this.height > defender.y;
    }
}

function setup() {
    defender = new Defender(canvasWidth / 2 - 25, canvasHeight - 60);
    gameInterval = setInterval(gameLoop, 1000 / framesPerSecond);
    addInvader();
}

function addInvader() {
    if (totalInvadersCreated < maxInvaders) {
        invaders.push(new Invader(0, 0));
        totalInvadersCreated++;
        setTimeout(addInvader, 1000);
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawScore();
    defender.draw();
    missiles.forEach((missile, index) => {
        missile.move();
        missile.draw();
        if (missile.y + missile.height < 0) {
            missiles.splice(index, 1);  // Remove missiles that pass the top of the screen
        }
        invaders.forEach((invader, invIndex) => {
            if (missile.hit(invader)) {
                missiles.splice(index, 1);
                invaders.splice(invIndex, 1);
                score++;
                if (score === maxInvaders) {
                    endGame("You Win!");
                }
            }
        });
    });
    bombs.forEach((bomb, index) => {
        bomb.move();
        bomb.draw();
        if (bomb.hit(defender)) {
            endGame("Game Over!");
        } else if (bomb.y > canvasHeight) {
            bombs.splice(index, 1);  // Remove bombs that pass the bottom of the screen
        }
    });
    invaders.forEach(invader => {
        invader.move();
        invader.draw();
        invader.dropBomb();
        if (invader.y + invader.height >= canvasHeight - defender.height) {
            endGame("Game Over!");
        }
    });
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

function endGame(message) {
    clearInterval(gameInterval);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.fillText(message, canvasWidth / 2 - 100, canvasHeight / 2);
    gameOver = true;
}

document.addEventListener('keydown', (event) => {
    if (gameOver) return;

    if (event.code === 'ArrowLeft') {
        defender.move('left');
    } else if (event.code === 'ArrowRight') {
        defender.move('right');
    } else if (event.code === 'Space') {
        if (missiles.length < 2) {  // Limit the defender to 2 missiles at a time
            missiles.push(new Missile(defender.x + defender.width / 2 - 2.5, defender.y));
        }
    }
});

setup();
