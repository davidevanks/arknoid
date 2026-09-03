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

// --- Transiciones de pantalla (clic / teclas) ---
function handleTransitions() {
  if ( input.pauseQueued ) {
    input.pauseQueued = false;
    if ( state.screen === 'playing' ) state.screen = 'paused';
    else if ( state.screen === 'paused' ) state.screen = 'playing';
  }

  if ( input.launchQueued ) {
    input.launchQueued = false;
    if ( state.screen === 'start' ) {
      state.screen = 'playing';
      launchBall();
    } else if ( state.screen === 'playing' && state.ballStuck ) {
      launchBall();
    } else if ( state.screen === 'gameover' || state.screen === 'win' ) {
      resetGame();
    }
  }
}

// --- Actualización del estado 'playing' ---
function update( dt ) {
  movePaddle( dt );

  if ( state.ballStuck ) {
    stickBallToPaddle();
    return;
  }

  moveBall( dt );

  // Victoria: no quedan bloques vivos
  if ( blocks.every( b => !b.alive ) ) {
    state.screen = 'win';
  }
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

  // Borde inferior: bola perdida
  if ( ball.y - ball.r > HEIGHT ) {
    loseLife();
  }
}

function loseLife() {
  state.lives--;
  if ( state.lives <= 0 ) {
    state.lives = 0;
    state.screen = 'gameover';
    return;
  }
  state.ballStuck = true;
  ball.vx = 220;
  ball.vy = -220;
  stickBallToPaddle();
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

// --- Render ---
function render( ctx ) {
  ctx.clearRect( 0, 0, WIDTH, HEIGHT );

  // Escena de juego (también de fondo bajo los overlays)
  drawBlocks( ctx, blocks );
  drawPaddle( ctx );
  drawBall( ctx );

  if ( state.screen === 'playing' || state.screen === 'paused' ) {
    drawHUD( ctx );
  }

  switch ( state.screen ) {
    case 'start':
      drawOverlay( ctx, 'ARKANOID', 'Pulsa para jugar' );
      break;
    case 'paused':
      drawOverlay( ctx, 'PAUSA', 'Pulsa Esc para reanudar' );
      break;
    case 'gameover':
      drawOverlay( ctx, 'GAME OVER', 'Puntuacion: ' + state.score + '  ·  Pulsa para reiniciar' );
      break;
    case 'win':
      drawOverlay( ctx, 'VICTORIA', 'Puntuacion: ' + state.score + '  ·  Pulsa para reiniciar' );
      break;
  }
}

function drawHUD( ctx ) {
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText( 'PUNTOS: ' + state.score, 12, 10 );
  ctx.textAlign = 'right';
  ctx.fillText( 'VIDAS: ' + state.lives, WIDTH - 12, 10 );
  ctx.restore();
}

function drawOverlay( ctx, title, subtitle ) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect( 0, 0, WIDTH, HEIGHT );
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '48px monospace';
  ctx.fillText( title, WIDTH / 2, HEIGHT / 2 - 30 );
  ctx.font = '20px monospace';
  ctx.fillText( subtitle, WIDTH / 2, HEIGHT / 2 + 30 );
  ctx.restore();
}
