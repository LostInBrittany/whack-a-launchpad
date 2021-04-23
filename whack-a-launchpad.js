import Launchpad from './node_modules/launchpad-webmidi/launchpad-webmidi.js';

let pad = new Launchpad();

let curX=-1;
let curY=-1;
let intervalID ;
let goodKeyPressed;
let speed;
let score;

let gameInProgress;

pad.connect().then( () => {     // Auto-detect Launchpad
  console.log('YEAH');
  pad.on( 'key', k => keyPressed(k));
  initBoard();
});

function initBoard() {
  gameInProgress = false;
  pad.reset( 0 );               // Make Launchpad glow amber
  pad.col(pad.green, [0,8]);    // Make light to start game green
  showScore();
}

function initGame() {
  clearInterval(intervalID);
  gameInProgress = true;
  goodKeyPressed = true;
  speed = 1;
  score = -1;
  nextPosition();
}


function keyPressed(k) {
  if (!k.pressed) {
    return;
  }
  console.log('Key', k);
  if (k.x == 0 && k.y == 8 && !gameInProgress) {
    initGame();
    return;
  }
  if (k.x == curX && k.y == curY) {
    goodKeyPressed = true;
    pad.col(pad.green, [ curX, curY ]);    
  } else {
    initBoard();
  }
}

function nextPosition() {
  if (!goodKeyPressed) {
    initBoard();
  } else {
    speed += 0.025;
    score++;
    console.log(speed);
    [ curX, curY ] = getDifferentPosition();
    console.log([ curX, curY ]);
    goodKeyPressed = false;
    pad.reset( 1 );           // Make Launchpad glow amber
    showScore();
    pad.col(pad.red, [0,8]);    
    pad.col(pad.red, [ curX, curY ]);
    intervalID = setTimeout(nextPosition, 1500/speed);
  };
}

function showScore() {
  if (score < 0) {
    return;
  }
  pad.col(pad.off, [ 
    [ 8, 0 ], [ 8, 1 ], [ 8, 2 ], [ 8, 3 ], 
    [ 8, 4 ], [ 8, 5 ], [ 8, 6 ], [ 8, 7 ], 
  ]);
  if (score <= 5) {
    pad.col(pad.amber, [ 8, 7 ]);
  }
  if (score > 5) {
    pad.col(pad.green, [ 8, 7 ]);
  }
  if (score > 5 && score <= 10) {
    pad.col(pad.amber, [ 8, 6 ]);
  }
  if (score > 10) {
    pad.col(pad.green, [ 8, 6 ]);
  }
  if (score > 10 && score <= 15) {
    pad.col(pad.amber, [ 8, 5 ]);
  }
  if (score > 15) {
    pad.col(pad.green, [ 8, 5 ]);
  }
  if (score > 15 && score <= 20) {
    pad.col(pad.amber, [ 8, 4 ]);
  }
  if (score > 20) {
    pad.col(pad.green, [ 8, 4 ]);
  }
  if (score > 20 && score <= 25) {
    pad.col(pad.amber, [ 8, 3 ]);
  }
  if (score > 25) {
    pad.col(pad.green, [ 8, 3 ]);
  }
  if (score > 25 && score <= 30) {
    pad.col(pad.amber, [ 8, 2 ]);
  }
  if (score > 30) {
    pad.col(pad.green, [ 8, 2 ]);
  }
  if (score > 30 && score <= 35) {
    pad.col(pad.amber, [ 8, 1 ]);
  }
  if (score > 35) {
    pad.col(pad.green, [ 8, 1 ]);
  }
  if (score > 35 && score <= 40) {
    pad.col(pad.amber, [ 8, 0 ]);
  }
  if (score > 40) {
    pad.col(pad.green, [ 8, 0 ]);
  }

}

function getRandomPosition() {
  return [
    Math.floor(8*Math.random()),
    Math.floor(8*Math.random()),
  ]
}

function getDifferentPosition(x,y) {
  let posX;
  let posY;

  do {
    [ posX, posY ] = getRandomPosition();
  } while (posX == x && posY == y);
  return [ posX, posY ];
}