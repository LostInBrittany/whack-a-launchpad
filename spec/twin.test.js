import { expect, fixture, html } from '@open-wc/testing';
import '@granite-elements/granite-launchpad/twin.js';

import { boardPad, repaint } from '../demo/board-pad.js';
import { FakeLaunchpad } from './helpers/fake-launchpad.js';

/**
 * The twin page starts the game straight away rather than waiting for the
 * hardware, because connecting means a permission prompt that may never be
 * answered. Whatever is already on screen when the Launchpad does connect has
 * to be pushed to it, or the board and the hardware disagree.
 */
describe( 'catching hardware up', () => {

  let twin;
  let hardware;

  beforeEach( async () => {
    twin = await fixture( html`<granite-launchpad></granite-launchpad>` );
    hardware = new FakeLaunchpad();
    twin.launchpad = hardware;
  } );

  it( 'writes nothing to hardware that is not connected yet', () => {
    const pad = boardPad( twin );

    pad.col( pad.green, [ 0, 8 ] );

    expect( hardware.writes ).to.have.lengthOf( 0 );
    expect( twin.getColor( 0, 8 ) ).to.equal( 'green' );
  } );

  it( 'sends the board as it stands once the Launchpad arrives', async () => {
    const pad = boardPad( twin );
    pad.col( pad.green, [ 0, 8 ] );
    await twin.connect();

    repaint( twin );

    expect( hardware.writes ).to.have.lengthOf( 80 );
    expect( twin.getColor( 0, 8 ) ).to.equal( 'green' );
  } );

  it( 'leaves the board exactly as it was', async () => {
    const pad = boardPad( twin );
    pad.col( pad.green, [ 0, 8 ] );
    pad.col( pad.red, [ 3, 4 ] );
    await twin.connect();

    repaint( twin );

    expect( twin.getColor( 0, 8 ) ).to.equal( 'green' );
    expect( twin.getColor( 3, 4 ) ).to.equal( 'red' );
    expect( twin.getColor( 1, 1 ) ).to.equal( 'off' );
  } );

  it( 'plays a press on the hardware as a press on the board', async () => {
    const pad = boardPad( twin );
    const keys = [];
    pad.on( 'key', ( k ) => keys.push( k ) );
    await twin.connect();

    hardware.press( 2, 3, true );

    expect( keys ).to.have.lengthOf( 1 );
    expect( [ keys[ 0 ].x, keys[ 0 ].y, keys[ 0 ].pressed ] ).to.deep.equal( [ 2, 3, true ] );
  } );

} );
