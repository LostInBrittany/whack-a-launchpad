import Launchpad from 'launchpad-webmidi';

// The twin reaches for launchpad.red.level(2) and friends, so borrow the real
// colour objects rather than trying to imitate them.
const palette = new Launchpad();

/**
 * Stands in for a Launchpad Mini, which no test runner has plugged in. Records
 * every write so a test can see what reached the hardware.
 */
export class FakeLaunchpad {

  constructor() {
    this.red = palette.red;
    this.green = palette.green;
    this.amber = palette.amber;
    this.yellow = palette.yellow;
    this.off = palette.off;
    this.writes = [];
    this.resets = [];
    this.connected = false;
    this._handlers = {};
  }

  connect() {
    this.connected = true;
    return Promise.resolve();
  }

  on( event, callback ) {
    ( this._handlers[ event ] = this._handlers[ event ] || [] ).push( callback );
  }

  col( color, buttons ) {
    this.writes.push( { color, buttons } );
    return Promise.resolve( true );
  }

  reset( brightness ) {
    this.resets.push( brightness );
  }

  /** Push a key event as the hardware would. */
  press( x, y, pressed ) {
    for ( const callback of this._handlers.key || [] ) {
      callback( { x, y, pressed } );
    }
  }
}
