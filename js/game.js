// js/game.js — estado, actualización y render del juego

const state = {
  screen: 'start',   // 'start' | 'playing' | 'paused' | 'gameover' | 'win'
  score: 0,
  lives: 3,
  ballStuck: true,   // la bola está pegada al paddle esperando lanzamiento
};

let blocks = buildBlocks( LEVEL_1 );

const WIDTH = 800;
const HEIGHT = 600;

function resetGame() {
  state.screen = 'start';
  state.score = 0;
  state.lives = 3;
  state.ballStuck = true;
  blocks = buildBlocks( LEVEL_1 );
  resetPaddleAndBall();
}

function launchBall() {
  state.ballStuck = false;
  ball.vx = 220;
  ball.vy = -220;
}

// --- Actualización del estado 'playing' ---
function update( dt ) {
  movePaddle( dt );

  if ( state.ballStuck ) {
    stickBallToPaddle();
    return;
  }

  moveBall( dt );
}

function movePaddle( dt ) {
  if ( input.paddleX !== null ) {
    paddle.x = input.paddleX;
  }
  if ( input.left ) paddle.x -= paddle.speed * dt;
  if ( input.right ) paddle.x += paddle.speed * dt;
  paddle.x = Math.max( 0, Math.min( WIDTH - paddle.w, paddle.x ) );
}

function moveBall( dt ) {
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Paredes laterales
  if ( ball.x - ball.r < 0 ) {
    ball.x = ball.r;
    ball.vx = -ball.vx;
  } else if ( ball.x + ball.r > WIDTH ) {
    ball.x = WIDTH - ball.r;
    ball.vx = -ball.vx;
  }

  // Techo
  if ( ball.y - ball.r < 0 ) {
    ball.y = ball.r;
    ball.vy = -ball.vy;
  }

  handlePaddleCollision();
  handleBlockCollisions();
}

const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60º respecto a la vertical

function handlePaddleCollision() {
  if ( ball.vy <= 0 ) return; // solo cuando baja
  const withinX = ball.x + ball.r > paddle.x && ball.x - ball.r < paddle.x + paddle.w;
  const withinY = ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.h;
  if ( !withinX || !withinY ) return;

  const speed = Math.hypot( ball.vx, ball.vy );
  let hit = ( ball.x - ( paddle.x + paddle.w / 2 ) ) / ( paddle.w / 2 );
  hit = Math.max( -1, Math.min( 1, hit ) );
  const angle = hit * MAX_BOUNCE_ANGLE;

  ball.vx = speed * Math.sin( angle );
  ball.vy = -Math.abs( speed * Math.cos( angle ) ); // componente vertical mínima garantizada
  ball.y = paddle.y - ball.r;
}

function handleBlockCollisions() {
  for ( const b of blocks ) {
    if ( !b.alive ) continue;
    const overlapX = ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w;
    const overlapY = ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h;
    if ( !overlapX || !overlapY ) continue;

    const penLeft = ( ball.x + ball.r ) - b.x;
    const penRight = ( b.x + b.w ) - ( ball.x - ball.r );
    const penTop = ( ball.y + ball.r ) - b.y;
    const penBottom = ( b.y + b.h ) - ( ball.y - ball.r );
    const minX = Math.min( penLeft, penRight );
    const minY = Math.min( penTop, penBottom );

    if ( minX < minY ) {
      ball.vx = -ball.vx;
    } else {
      ball.vy = -ball.vy;
    }

    b.alive = false;
    state.score += 10;
    return; // un bloque por frame
  }
}

// --- Render del estado 'playing' ---
function render( ctx ) {
  ctx.clearRect( 0, 0, WIDTH, HEIGHT );
  drawBlocks( ctx, blocks );
  drawPaddle( ctx );
  drawBall( ctx );
}
