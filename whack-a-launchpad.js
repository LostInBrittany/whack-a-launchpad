import Launchpad from 'launchpad-webmidi';

import { createGame } from './game.js';

const pad = new Launchpad();

pad.connect()                     // Auto-detect Launchpad
  .then( () => createGame( pad ) )
  .catch( ( err ) => showConnectionError( err ) );

// connect() rejects with an Error when no Launchpad is plugged in, and with a
// plain string when the browser has no Web MIDI API, so read both shapes.
function showConnectionError( err ) {
  const message = err && err.message ? err.message : String( err );
  console.error( 'Could not connect to the Launchpad:', message );
  const status = document.querySelector( '#status' );
  if ( status ) {
    status.textContent = `Could not connect to the Launchpad: ${ message }`;
  }
}
