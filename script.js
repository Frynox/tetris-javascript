const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

function createPiece(type) {
    switch (type) {
        case 'I':
            return [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
            ];
        case 'J':
            return [
                [0, 2, 0],
                [0, 2, 0],
                [2, 2, 0],
            ];
        case 'L':
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        case 'O':
            return [
                [4, 4],
                [4, 4],
            ];
        case 'S':
            return [
                [0, 5, 5],
                [5, 5, 0],
                [0, 0, 0],
            ];
        case 'T':
            return [
                [0, 6, 0],
                [6, 6, 6],
                [0, 0, 0],
            ];
        case 'Z':
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
    }
}

function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

const arena = createMatrix(12, 20);

const colors = [
    null,
    '#00f0f0',
    '#0000f0',
    '#f0a000',
    '#f0f000',
    '#00f000',
    '#a000f0',
    '#f00000',
];

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Crear gradiente para cada bloque
                const gradient = context.createLinearGradient(
                    x + offset.x,
                    y + offset.y,
                    x + offset.x + 1,
                    y + offset.y + 1
                );
                gradient.addColorStop(0, colors[value]);
                gradient.addColorStop(1, '#ffffff');

                context.fillStyle = gradient;
                context.fillRect(
                    x + offset.x,
                    y + offset.y,
                    1,
                    1
                );

                // Agregar borde al bloque
                context.strokeStyle = '#000000';
                context.lineWidth = 0.05;
                context.strokeRect(
                    x + offset.x,
                    y + offset.y,
                    1,
                    1
                );
            }
        });
    });
}


function draw() {
    // Crear un gradiente de fondo
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e1e1e');
    gradient.addColorStop(1, '#3e3e3e');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}


const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

function showGameOver() {
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#ffffff';
    context.font = '1.5px Roboto';
    context.fillText('Juego Terminado', 3, 10);
}


function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(
        pieces[(pieces.length * Math.random()) | 0]
    );
    player.pos.y = 0;
    player.pos.x =
        ((arena[0].length / 2) | 0) -
        ((player.matrix[0].length / 2) | 0);

    if (collide(arena, player)) {
        gameOver = true;
        // Mostrar mensaje de fin de juego
        showGameOver();
    }
}


function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (
                m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0
            ) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function arenaSweep() {
    let rowCount = 0;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        rowCount++;
    }
    if (rowCount > 0) {
        player.score += rowCount * 10;
        updateScore();
        updateDropInterval(); // Actualizar velocidad de caída
    }
}


let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

let gameOver = false;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    if (!gameOver) {
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }

        draw();
    }
    requestAnimationFrame(update);
}

// Ajustar el intervalo de caída según la puntuación
function updateDropInterval() {
    dropInterval = 1000 - (player.score * 10);
    if (dropInterval < 100) {
        dropInterval = 100; // Establecer una velocidad mínima
    }
}


document.getElementById('restart-button').addEventListener('click', () => {
    // Reiniciar variables del juego
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    playerReset();
    gameOver = false;
});


document.addEventListener('keydown', (event) => {
    if (!gameOver) {
        if (event.keyCode === 37) {
            // Mover a la izquierda
            playerMove(-1);
        } else if (event.keyCode === 39) {
            // Mover a la derecha
            playerMove(1);
        } else if (event.keyCode === 40) {
            // Caída rápida
            playerDrop();
        } else if (event.keyCode === 81) {
            // Rotar a la izquierda
            playerRotate(-1);
        } else if (event.keyCode === 87) {
            // Rotar a la derecha
            playerRotate(1);
        }
    }
});


function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach((row) => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function updateScore() {
    document.getElementById('score').innerText =
        'Puntuación: ' + player.score;
}

playerReset();
updateScore();
update();
