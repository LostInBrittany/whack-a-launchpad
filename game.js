/**
 * The game itself. It knows nothing about where its board comes from: give it
 * anything with the launchpad-webmidi surface - a real Launchpad, or the
 * adapter in demo/board-pad.js wrapping a granite-launchpad element - and it
 * plays there.
 */

/** The Scene column, bottom to top, where the score is shown. */
const SCORE_LAMPS = [
  [ 8, 0 ], [ 8, 1 ], [ 8, 2 ], [ 8, 3 ],
  [ 8, 4 ], [ 8, 5 ], [ 8, 6 ], [ 8, 7 ],
];

/** How many points one lamp is worth. */
const POINTS_PER_LAMP = 5;

/** The leftmost Automap button, which starts a run. */
const START_BUTTON = [ 0, 8 ];

/**
 * Start playing on a connected pad.
 *
 * @param {Object} pad A connected Launchpad, or anything with its interface
 * @param {Object} [options]
 * @param {Number} [options.interval] Milliseconds the first target lasts
 * @param {Function} [options.random] Stands in for Math.random
 * @return {{stop: Function}} stop() cancels a target in flight
 */
export function createGame( pad, { interval = 1500, random = Math.random } = {} ) {

  let curX = -1;
  let curY = -1;
  let timeoutID;
  let goodKeyPressed = false;
  let speed = 1;
  let score = -1;
  let gameInProgress = false;

  pad.on( 'key', ( k ) => keyPressed( k ) );
  initBoard();

  return {
    stop() {
      clearTimeout( timeoutID );
    },
  };

  function initBoard() {
    clearTimeout( timeoutID );
    gameInProgress = false;
    pad.reset( 0 );                       // Every LED off
    pad.col( pad.green, START_BUTTON );
    showScore();
  }

  function initGame() {
    clearTimeout( timeoutID );
    gameInProgress = true;
    goodKeyPressed = true;
    speed = 1;
    score = -1;
    nextPosition();
  }

  function keyPressed( k ) {
    if ( !k.pressed ) {
      return;
    }
    if ( k.x === START_BUTTON[ 0 ] && k.y === START_BUTTON[ 1 ] && !gameInProgress ) {
      initGame();
      return;
    }
    if ( k.x === curX && k.y === curY ) {
      goodKeyPressed = true;
      pad.col( pad.green, [ curX, curY ] );
    } else {
      initBoard();
    }
  }

  function nextPosition() {
    if ( !goodKeyPressed ) {
      initBoard();
      return;
    }
    speed += 0.025;
    score++;
    [ curX, curY ] = differentPosition( curX, curY );
    goodKeyPressed = false;
    pad.reset( 1 );                       // Make the whole board glow amber
    showScore();
    pad.col( pad.red, START_BUTTON );
    pad.col( pad.red, [ curX, curY ] );
    timeoutID = setTimeout( nextPosition, interval / speed );
  }

  /**
   * The score fills the Scene column from the bottom up, one lamp per five
   * points: amber while a lamp is being worked through, green once cleared.
   */
  function showScore() {
    if ( score < 0 ) {
      return;
    }
    pad.col( pad.off, SCORE_LAMPS );

    for ( let lamp = 0; lamp < SCORE_LAMPS.length; lamp++ ) {
      const [ x, y ] = SCORE_LAMPS[ SCORE_LAMPS.length - 1 - lamp ];
      const banked = lamp * POINTS_PER_LAMP;
      if ( score > banked + POINTS_PER_LAMP ) {
        pad.col( pad.green, [ x, y ] );
      } else if ( score > banked || lamp === 0 ) {
        pad.col( pad.amber, [ x, y ] );
      }
    }
  }

  /**
   * A random square on the 8x8 grid, never the one the last target was on:
   * leaving it there would ask you to hit a pad your finger is already on.
   *
   * @param {Number} x The column to avoid
   * @param {Number} y The row to avoid
   */
  function differentPosition( x, y ) {
    let posX;
    let posY;

    do {
      posX = Math.floor( 8 * random() );
      posY = Math.floor( 8 * random() );
    } while ( posX === x && posY === y );

    return [ posX, posY ];
  }
}
