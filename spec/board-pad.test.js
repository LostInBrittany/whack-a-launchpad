import { expect, fixture, html } from '@open-wc/testing';
import '@granite-elements/granite-launchpad';

import { boardPad } from '../demo/board-pad.js';

describe( 'boardPad', () => {

  let board;
  let pad;

  beforeEach( async () => {
    board = await fixture( html`<granite-launchpad-board></granite-launchpad-board>` );
    pad = boardPad( board );
  } );

  describe( 'connect()', () => {

    it( 'resolves, since there is nothing to plug in', async () => {
      await pad.connect();
    } );

  } );

  describe( 'colours', () => {

    it( 'exposes the hues the game asks for', () => {
      expect( pad.off ).to.equal( 'off' );
      expect( pad.red ).to.equal( 'red' );
      expect( pad.green ).to.equal( 'green' );
      expect( pad.amber ).to.equal( 'amber' );
      expect( pad.yellow ).to.equal( 'yellow' );
    } );

  } );

  describe( 'col()', () => {

    it( 'paints the pad at a single [x, y] pair', async () => {
      await pad.col( pad.green, [ 0, 8 ] );

      expect( board.getColor( 0, 8 ) ).to.equal( 'green' );
    } );

    it( 'paints every pair when given a list of them', async () => {
      await pad.col( pad.red, [ [ 1, 2 ], [ 3, 4 ] ] );

      expect( board.getColor( 1, 2 ) ).to.equal( 'red' );
      expect( board.getColor( 3, 4 ) ).to.equal( 'red' );
    } );

    it( 'leaves the rest of the board alone', async () => {
      await pad.col( pad.green, [ 0, 8 ] );

      expect( board.getColor( 1, 8 ) ).to.equal( 'off' );
    } );

    it( 'is a no-op at (8, 8), where the hardware has no button', async () => {
      await pad.col( pad.red, [ 8, 8 ] );

      expect( board.getColor( 8, 8 ) ).to.equal( undefined );
    } );

  } );

  describe( 'reset()', () => {

    it( 'turns every pad off at brightness 0', async () => {
      await pad.col( pad.green, [ 3, 3 ] );

      pad.reset( 0 );

      expect( litPads( board ) ).to.deep.equal( [] );
    } );

    it( 'turns every pad off when given no brightness at all', async () => {
      await pad.col( pad.green, [ 3, 3 ] );

      pad.reset();

      expect( litPads( board ) ).to.deep.equal( [] );
    } );

    it( 'lights all 80 pads amber low at brightness 1', () => {
      pad.reset( 1 );

      const lit = litPads( board );
      expect( lit ).to.have.lengthOf( 80 );
      expect( lit.every( ( [ , , color ] ) => color === 'amber low' ) ).to.be.true;
    } );

    it( 'lights the Automap row and the Scene column too', () => {
      pad.reset( 1 );

      expect( board.getColor( 0, 8 ) ).to.equal( 'amber low' );
      expect( board.getColor( 8, 0 ) ).to.equal( 'amber low' );
    } );

    it( 'uses medium brightness at 2', () => {
      pad.reset( 2 );

      expect( board.getColor( 0, 0 ) ).to.equal( 'amber medium' );
    } );

    it( 'uses full brightness at 3', () => {
      pad.reset( 3 );

      expect( board.getColor( 0, 0 ) ).to.equal( 'amber' );
    } );

  } );

  describe( 'on( \'key\' )', () => {

    it( 'reports a press on screen as a pressed key', () => {
      const keys = [];
      pad.on( 'key', ( k ) => keys.push( k ) );

      press( board, 3, 4 );

      expect( keys ).to.have.lengthOf( 1 );
      expect( keys[ 0 ].x ).to.equal( 3 );
      expect( keys[ 0 ].y ).to.equal( 4 );
      expect( keys[ 0 ].pressed ).to.be.true;
    } );

    it( 'reports a release as a key that is no longer pressed', () => {
      const keys = [];
      pad.on( 'key', ( k ) => keys.push( k ) );

      press( board, 3, 4 );
      release( board, 3, 4 );

      expect( keys ).to.have.lengthOf( 2 );
      expect( keys[ 1 ].pressed ).to.be.false;
    } );

    it( 'reports the Automap row, where the game starts', () => {
      const keys = [];
      pad.on( 'key', ( k ) => keys.push( k ) );

      press( board, 0, 8 );

      expect( [ keys[ 0 ].x, keys[ 0 ].y ] ).to.deep.equal( [ 0, 8 ] );
    } );

    it( 'hands back a key that col() accepts as coordinates', async () => {
      let key;
      pad.on( 'key', ( k ) => { key = k; } );
      press( board, 2, 5 );

      await pad.col( pad.red, key );

      expect( board.getColor( 2, 5 ) ).to.equal( 'red' );
    } );

    it( 'ignores events it does not model', () => {
      const seen = [];
      pad.on( 'connected', () => seen.push( 'connected' ) );

      press( board, 0, 0 );

      expect( seen ).to.deep.equal( [] );
    } );

  } );

} );

/** Every pad that is not off, as [x, y, color]. */
function litPads( board ) {
  const lit = [];
  for ( let y = 0; y <= 8; y++ ) {
    for ( let x = 0; x <= 8; x++ ) {
      const color = board.getColor( x, y );
      if ( color && color !== 'off' ) {
        lit.push( [ x, y, color ] );
      }
    }
  }
  return lit;
}
/** Press a pad the way a finger or a mouse does. */
function press( board, x, y ) {
  board.padAt( x, y ).dispatchEvent(
    new PointerEvent( 'pointerdown', { pointerId: 1, bubbles: true, composed: true } ) );
}

/** Release it again. */
function release( board, x, y ) {
  board.padAt( x, y ).dispatchEvent(
    new PointerEvent( 'pointerup', { pointerId: 1, bubbles: true, composed: true } ) );
}
