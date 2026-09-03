// js/input.js — entrada de ratón y teclado

const input = {
  left: false,        // ← o A mantenida
  right: false,       // → o D mantenida
  paddleX: null,      // x (esquina izq.) objetivo del paddle según el ratón; null si no se ha movido
  launchQueued: false, // clic o tecla: arrancar / lanzar bola / reiniciar
  pauseQueued: false,  // Esc
};

const canvas = document.getElementById( 'game' );

function clampPaddleX( x ) {
  return Math.max( 0, Math.min( canvas.width - paddle.w, x ) );
}

canvas.addEventListener( 'mousemove', ( e ) => {
  const rect = canvas.getBoundingClientRect();
  const cx = ( e.clientX - rect.left ) * ( canvas.width / rect.width );
  input.paddleX = clampPaddleX( cx - paddle.w / 2 );
} );

canvas.addEventListener( 'mousedown', () => {
  input.launchQueued = true;
} );

window.addEventListener( 'keydown', ( e ) => {
  switch ( e.code ) {
    case 'ArrowLeft':
    case 'KeyA':
      input.left = true;
      e.preventDefault();
      break;
    case 'ArrowRight':
    case 'KeyD':
      input.right = true;
      e.preventDefault();
      break;
    case 'Escape':
      input.pauseQueued = true;
      break;
    default:
      input.launchQueued = true;
  }
} );

window.addEventListener( 'keyup', ( e ) => {
  if ( e.code === 'ArrowLeft' || e.code === 'KeyA' ) input.left = false;
  if ( e.code === 'ArrowRight' || e.code === 'KeyD' ) input.right = false;
} );
