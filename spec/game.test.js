import { expect, fixture, html, aTimeout } from '@open-wc/testing';
import '@granite-elements/granite-launchpad';

import { boardPad } from '../demo/board-pad.js';
import { createGame } from '../game.js';

/** Short enough to keep the suite quick, long enough not to expire mid-press. */
const ROUND = 60;

describe( 'createGame', () => {

  let board;
  let pad;
  let game;

  beforeEach( async () => {
    board = await fixture( html`<granite-launchpad-board></granite-launchpad-board>` );
    pad = boardPad( board );
  } );

  afterEach( () => game && game.stop() );

  describe( 'before the first press', () => {

    it( 'lights the start button green', () => {
      game = createGame( pad );

      expect( board.getColor( 0, 8 ) ).to.equal( 'green' );
    } );

    it( 'leaves the rest of the board dark', () => {
      game = createGame( pad );

      expect( litPads( board ) ).to.deep.equal( [ [ 0, 8, 'green' ] ] );
    } );

  } );

  describe( 'starting a round', () => {

    beforeEach( () => {
      game = createGame( pad, { interval: ROUND, random: fixedRandom( [ 3, 4 ] ) } );
      press( board, 0, 8 );
    } );

    it( 'makes the grid glow amber', () => {
      expect( board.getColor( 0, 0 ) ).to.equal( 'amber low' );
    } );

    it( 'lights one target red', () => {
      expect( board.getColor( 3, 4 ) ).to.equal( 'red' );
    } );

    it( 'turns the start button red while the game runs', () => {
      expect( board.getColor( 0, 8 ) ).to.equal( 'red' );
    } );

    it( 'lights the bottom score lamp', () => {
      expect( board.getColor( 8, 7 ) ).to.equal( 'amber' );
    } );

  } );

  describe( 'playing', () => {

    beforeEach( () => {
      game = createGame( pad, { interval: ROUND, random: fixedRandom( [ 3, 4 ], [ 6, 1 ] ) } );
      press( board, 0, 8 );
    } );

    it( 'turns a hit target green', () => {
      press( board, 3, 4 );

      expect( board.getColor( 3, 4 ) ).to.equal( 'green' );
    } );

    it( 'moves on to the next target', async () => {
      press( board, 3, 4 );

      await aTimeout( ROUND * 1.5 );

      expect( board.getColor( 6, 1 ) ).to.equal( 'red' );
    } );

    it( 'ends the run when the wrong pad is hit', () => {
      press( board, 0, 0 );

      // The score column stays lit after a run, so you can read what you got.
      expect( litPads( board ) ).to.deep.equal(
        [ [ 8, 7, 'amber' ], [ 0, 8, 'green' ] ] );
    } );

    it( 'ends the run when the target expires unhit', async () => {
      await aTimeout( ROUND * 1.5 );

      expect( litPads( board ) ).to.deep.equal(
        [ [ 8, 7, 'amber' ], [ 0, 8, 'green' ] ] );
    } );

  } );

  describe( 'the score column', () => {

    it( 'turns the bottom lamp green once five points are cleared', async () => {
      game = createGame( pad, { interval: ROUND, random: walkingRandom() } );
      press( board, 0, 8 );

      // The lamp goes green above five points, and a point is scored each
      // time a new target appears, so this needs six more rounds.
      let spot = findTarget( board );
      for ( let round = 0; round < 6; round++ ) {
        press( board, ...spot );
        spot = await nextTarget( board );
      }

      expect( board.getColor( 8, 7 ) ).to.equal( 'green' );
      expect( board.getColor( 8, 6 ) ).to.equal( 'amber' );
    } );

  } );

  describe( 'choosing the next target', () => {

    it( 'never puts it where the last one was', async () => {
      // The second position drawn repeats the first, so the game has to draw
      // again rather than ask for a square that is already under your finger.
      game = createGame( pad, {
        interval: ROUND,
        random: fixedRandom( [ 3, 4 ], [ 3, 4 ], [ 5, 2 ] ),
      } );
      press( board, 0, 8 );
      press( board, 3, 4 );

      const next = await nextTarget( board );

      expect( next ).to.deep.equal( [ 5, 2 ] );
    } );

  } );

} );

/**
 * Press a pad and let go, the way a finger or a mouse does. Releasing matters:
 * a pad still holding a pointer ignores the next press on it, and over a run
 * the same pad comes up as the target more than once.
 */
function press( board, x, y ) {
  const pad = board.padAt( x, y );
  pad.dispatchEvent(
    new PointerEvent( 'pointerdown', { pointerId: 1, bubbles: true, composed: true } ) );
  pad.dispatchEvent(
    new PointerEvent( 'pointerup', { pointerId: 1, bubbles: true, composed: true } ) );
}

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

/** The red pad on the 8x8 grid, which is the target to whack. */
function findTarget( board ) {
  for ( let y = 0; y < 8; y++ ) {
    for ( let x = 0; x < 8; x++ ) {
      if ( board.getColor( x, y ) === 'red' ) {
        return [ x, y ];
      }
    }
  }
  return undefined;
}

/**
 * Wait for the next target to appear. A hit target turns green, so between a
 * hit and the next round there is no red pad on the grid to confuse this.
 * Rounds get shorter as the game speeds up, which is why this watches the
 * board instead of counting on a fixed wait staying inside the window.
 */
async function nextTarget( board ) {
  for ( let tries = 0; tries < 200; tries++ ) {
    await aTimeout( 5 );
    const spot = findTarget( board );
    if ( spot ) {
      return spot;
    }
  }
  throw new Error( 'the next target never arrived' );
}

/**
 * Stands in for Math.random so the targets are known in advance. Each pair is
 * returned as the two draws the game makes for one position.
 */
function fixedRandom( ...positions ) {
  const draws = positions.flat().map( ( n ) => n / 8 );
  let i = 0;
  return () => draws[ i++ % draws.length ];
}

/** Targets that never repeat two rounds running, so a hit is unambiguous. */
function walkingRandom() {
  let i = 0;
  return () => ( i++ % 8 ) / 8;
}