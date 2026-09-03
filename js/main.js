// js/main.js — arranque y bucle principal

const gameCanvas = document.getElementById( 'game' );
const gameCtx = gameCanvas.getContext( '2d' );

let lastTime = 0;

function frame( now ) {
  let dt = ( now - lastTime ) / 1000;
  lastTime = now;
  // Clamp para evitar saltos grandes (pestaña en segundo plano)
  if ( dt > 0.05 ) dt = 0.05;

  handleTransitions();

  if ( state.screen === 'playing' ) {
    update( dt );
  }

  render( gameCtx );

  requestAnimationFrame( frame );
}

loadSpritesheet( () => {
  resetGame();
  lastTime = performance.now();
  requestAnimationFrame( frame );
} );
