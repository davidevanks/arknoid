// js/levels.js — layout único del MVP

// 'r' red, 'y' yellow, 'c' cyan, 'm' magenta, 'p' hotpink, 'g' green, '.' vacío
const LEVEL_1 = [
  'rrrrrrrrrrrrr',
  'yyyyyyyyyyyyy',
  'ccccccccccccc',
  'mmmmmmmmmmmmm',
  'ppppppppppppp',
  'ggggggggggggg',
];

const BLOCK_W = 56;
const BLOCK_H = 20;
const BLOCK_GAP = 4;
const GRID_TOP = 60;

const CHAR_TO_COLOR = {
  r: 'red',
  y: 'yellow',
  c: 'cyan',
  m: 'magenta',
  p: 'hotpink',
  g: 'green',
};

// Devuelve el array de bloques activos con coords calculadas.
// Bloque: { x, y, w, h, color, alive }
function buildBlocks( level ) {
  const cols = level.reduce( ( max, row ) => Math.max( max, row.length ), 0 );
  const gridWidth = cols * BLOCK_W + ( cols - 1 ) * BLOCK_GAP;
  const offsetX = Math.round( ( 800 - gridWidth ) / 2 );

  const blocks = [];
  for ( let r = 0; r < level.length; r++ ) {
    const row = level[ r ];
    for ( let col = 0; col < row.length; col++ ) {
      const ch = row[ col ];
      const color = CHAR_TO_COLOR[ ch ];
      if ( !color ) continue;
      blocks.push( {
        x: offsetX + col * ( BLOCK_W + BLOCK_GAP ),
        y: GRID_TOP + r * ( BLOCK_H + BLOCK_GAP ),
        w: BLOCK_W,
        h: BLOCK_H,
        color,
        alive: true,
      } );
    }
  }
  return blocks;
}
