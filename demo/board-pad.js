/**
 * Every button the hardware has. (8, 8) is missing because the corner where
 * the Automap row meets the Scene column has no button on a Launchpad Mini.
 */
const ALL_BUTTONS = [];
for ( let y = 0; y <= 8; y++ ) {
  for ( let x = 0; x <= 8; x++ ) {
    if ( x !== 8 || y !== 8 ) {
      ALL_BUTTONS.push( [ x, y ] );
    }
  }
}

/**
 * What "all LEDs on" means at each brightness. A Launchpad reset with a
 * brightness lights the whole board amber; anything outside 1-3 clears it.
 */
const ALL_ON = [ null, 'amber low', 'amber medium', 'amber' ];

/**
 * A key event shaped the way launchpad-webmidi shapes one. It pretends to be
 * an array as well as an object, so a handler can pass it straight back into
 * col() as coordinates.
 *
 * @param {{x: Number, y: Number}} detail A pad-press or pad-release detail
 * @param {Boolean} pressed
 */
function keyEvent( { x, y }, pressed ) {
  return { x, y, pressed, 0: x, 1: y, length: 2 };
}

/**
 * Wraps a <granite-launchpad-board> or <granite-launchpad> in the slice of the
 * launchpad-webmidi Launchpad interface the game uses, so the same game code
 * drives hardware or a screen without knowing which.
 *
 * @param {HTMLElement} element A granite-launchpad board or twin
 * @return {Object} A Launchpad-shaped object
 */
export function boardPad( element ) {

  return {

    off: 'off',
    red: 'red',
    green: 'green',
    amber: 'amber',
    yellow: 'yellow',

    connect() {
      return Promise.resolve();
    },

    /**
     * @param {String} event Only 'key' is modelled
     * @param {Function} callback
     */
    on( event, callback ) {
      if ( event !== 'key' ) {
        return;
      }
      element.addEventListener( 'pad-press',
        ( e ) => callback( keyEvent( e.detail, true ) ) );
      element.addEventListener( 'pad-release',
        ( e ) => callback( keyEvent( e.detail, false ) ) );
    },

    /**
     * @param {Number} [brightness] 1-3 lights every LED amber at that level.
     * Anything else - including nothing - clears the board.
     */
    reset( brightness ) {
      element.reset();
      const color = ALL_ON[ brightness ];
      if ( color ) {
        element.setColors( ALL_BUTTONS.map( ( [ x, y ] ) => [ x, y, color ] ) );
      }
    },

    /**
     * @param {String} color A colour string from this object
     * @param {Array} buttons An [x, y] pair, or an array of them
     */
    col( color, buttons ) {
      // launchpad-webmidi tests the first entry the same way, which is what
      // lets a key event - array-like but not an Array - come back in here.
      if ( buttons.length > 0 && buttons[ 0 ] instanceof Array ) {
        element.setColors( buttons.map( ( [ x, y ] ) => [ x, y, color ] ) );
      } else {
        element.setColor( buttons[ 0 ], buttons[ 1 ], color );
      }
      return Promise.resolve();
    },

  };
}

/**
 * Re-send every pad's current colour. A twin only writes to hardware once it
 * is connected, and connecting means a permission prompt the page cannot wait
 * on, so whatever the game has already painted has to be pushed across when
 * the Launchpad finally arrives.
 *
 * @param {HTMLElement} element A granite-launchpad twin
 */
export function repaint( element ) {
  element.setColors(
    ALL_BUTTONS.map( ( [ x, y ] ) => [ x, y, element.getColor( x, y ) ] ) );
}
