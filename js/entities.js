// js/entities.js — estado y dibujo de paddle, bola y bloques

const paddle = { x: 320, y: 560, w: 96, h: 16, speed: 480 }; // speed: px/seg (teclado)

const ball = { x: 400, y: 544, r: 8, vx: 220, vy: -220 };     // velocidad px/seg

// Restaura paddle y bola a su posición inicial (bola pegada, centrada sobre el paddle).
function resetPaddleAndBall() {
  paddle.x = 320;
  paddle.y = 560;
  ball.r = 8;
  ball.vx = 220;
  ball.vy = -220;
  stickBallToPaddle();
}

// Coloca la bola pegada encima del centro del paddle.
function stickBallToPaddle() {
  ball.x = paddle.x + paddle.w / 2;
  ball.y = paddle.y - ball.r;
}

function drawPaddle( ctx ) {
  drawSprite( ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h );
}

function drawBall( ctx ) {
  drawSprite( ctx, 'ball', ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2 );
}

function drawBlocks( ctx, blocks ) {
  for ( const b of blocks ) {
    if ( !b.alive ) continue;
    drawSprite( ctx, 'block_' + b.color, b.x, b.y, b.w, b.h );
  }
}
