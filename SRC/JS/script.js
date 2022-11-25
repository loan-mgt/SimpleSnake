class snakeParts {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Apple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Wall {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const canGame = document.querySelector("canvas");
const ctx = canGame.getContext("2d");
const startBtn = document.querySelector("#start");

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
//document.addEventListener("click", run);

const MaxY = 600;
const MaxX = 600;
const speed = 10;
const tileCount = 20;
const tileSize = 10; //MaxX/tileCount;

let SnakeX = 1;
let SnakeY = 1;

let VelX = 1;
let VelY = 0;

const parts = [new snakeParts(SnakeX, SnakeY)];

let lost = false;
let apples = [];
let walls = [];
let score = 0;

let MODE = "MENU";
let LEVEL_SEL = 0;
const LEVEL_LIST = ["1", "2"];
let delai = 0;

async function loadLevel(id) {
  let reponse = await fetch("./SRC/LEVEL/" + id + ".json");
  let json = await reponse.json();
  return json;
}

function drawMenu() {
  clearScreen();
  console.log("menu");
  ctx.fillStyle = "white";
  ctx.font = "17px Arial";
  ctx.fillText("Press Enter to select Level", 10, 20);
}

function drawLevel() {
  clearScreen();
  let pointer = "";
  for (var i = LEVEL_LIST.length - 1; i >= 0; i--) {
    ctx.fillStyle = "white";
    pointer = "   ";
    if (i == LEVEL_SEL) {
      ctx.fillStyle = "orange";
      pointer = "> ";
    }
    ctx.font = "17px Arial";
    ctx.fillText(pointer + "Level " + LEVEL_LIST[i], 10, 20 + 20 * i);
  }
}

function clearScreen() {
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, MaxX, MaxY);
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "17px Arial";
  ctx.fillText("Score: " + score, canGame.clientWidth - 75, 24);
}

function drawSnake() {
  //console.log(parts)
  for (let i = 0; i < parts.length; i++) {
    if (i == 0) {
      ctx.fillStyle = "orangered";
    } else {
      ctx.fillStyle = "orange";
    }
    let part = parts[i];
    ctx.fillRect(
      part.x * tileCount,
      part.y * tileCount,
      2 * tileSize,
      2 * tileSize
    );
  }
}

function drawFood() {
  apples.forEach((e) => {
    ctx.fillStyle = "red";
    ctx.fillRect(e.x * tileCount, e.y * tileCount, 2 * tileSize, 2 * tileSize);
  });
}

function drawWall() {
  //console.log("walss",walls)
  walls.forEach((e) => {
    //console.log(e.x,e.y)
    ctx.fillStyle = "grey";
    ctx.fillRect(e.x * tileCount, e.y * tileCount, 2 * tileSize, 2 * tileSize);
  });
}

function addSnakePart() {
  if (VelX == 1) {
    parts.push(
      new snakeParts(parts[parts.length - 1].x - 1, parts[parts.length - 1].y)
    );
  } else if (VelX == -1) {
    parts.push(
      new snakeParts(parts[parts.length - 1].x + 1, parts[parts.length - 1].y)
    );
  } else if (VelY == 1) {
    parts.push(
      new snakeParts(parts[parts.length - 1].x, parts[parts.length - 1].y - 1)
    );
  } else if (VelY == -1) {
    parts.push(
      new snakeParts(parts[parts.length - 1].x, parts[parts.length - 1].y + 1)
    );
  }
}
function checkSnakeEat() {
  apples.forEach((e) => {
    if (e.x == parts[0].x && e.y == parts[0].y) {
      apples.pop(e);
      score++;
      addSnakePart();
      apples.push(
        new Apple(
          Math.floor(Math.random() * tileCount),
          Math.floor(Math.random() * tileCount)
        )
      );
    }
  });
}

function checkOutside() {
  if (
    parts[0].x < 0 ||
    parts[0].x > tileCount + tileSize ||
    parts[0].y < 0 ||
    parts[0].y > tileCount + tileSize
  ) {
    return true;
  }
}

function checkHimselfCollision() {
  for (let i = 1; i < parts.length; i++) {
    if (parts[0].x == parts[i].x && parts[0].y == parts[i].y) {
      return true;
    }
  }
}

function checkWallCollision() {
  console.log("SNAKE", parts[0].x, parts[0].y);
  for (let i = 0; i < walls.length; i++) {
    console.log(walls[i].x, walls[i].y);
    if (parts[0].x == walls[i].x && parts[0].y == walls[i].y) {
      return true;
    }
  }
}

function moveSnake() {
  for (let i = parts.length - 1; i > 0; i--) {
    parts[i].x = parts[i - 1].x;
    parts[i].y = parts[i - 1].y;
  }
  parts[0].x += VelX;
  parts[0].y += VelY;
}

async function startGame(level) {
  MODE = "GAME";
  let lev = await loadLevel(level);

  for (var i = lev["food"].length - 1; i >= 0; i--) {
    apples.push(new Apple(lev["food"][i][0], lev["food"][i][1]));
  }
  for (var i = lev["walls"].length - 1; i >= 0; i--) {
    walls.push(new Wall(lev["walls"][i][0], lev["walls"][i][1]));
  }

  for (var i = lev["snake"].length - 1; i >= 0; i--) {
    parts.push(new snakeParts(lev["snake"][i][0], lev["snake"][i][1]));
  }

  delai = lev["delay"];

  drawFood();
  drawWall();
  drawSnake();
  drawScore();
  setTimeout(run, delai);
}

function run() {
  moveSnake();

  clearScreen();
  checkSnakeEat();

  if (checkOutside() || checkHimselfCollision() || checkWallCollision()) {
    location.reload();
  }

  drawFood();
  drawWall();
  drawSnake();
  drawScore();

  setTimeout(run, 1000 / speed);
}

function keyDown(event) {
  if (MODE == "GAME") {
    if (event.keyCode == 38) {
      if (VelY == 1) {
        return;
      }
      VelY = -1;
      VelX = 0;
    } else if (event.keyCode == 40) {
      if (VelY == -1) {
        return;
      }
      VelY = 1;
      VelX = 0;
    } else if (event.keyCode == 37) {
      if (VelX == 1) {
        return;
      }
      VelY = 0;
      VelX = -1;
    } else if (event.keyCode == 39) {
      if (VelX == -1) {
        return;
      }
      VelY = 0;
      VelX = 1;
    }
  }
}

function keyUp(event) {
  if (MODE == "LEVEL") {
    console.log("key codde", event.keyCode);
    if (event.keyCode == 40) {
      LEVEL_SEL = Math.min(LEVEL_LIST.length, LEVEL_SEL + 1);
      clearScreen();
      drawLevel();
    }
    if (event.keyCode == 38) {
      LEVEL_SEL = Math.max(0, LEVEL_SEL - 1);
      clearScreen();
      drawLevel();
    }
    if (event.keyCode == 13) {
      MODE = "GAME";
      clearScreen();
      startGame(LEVEL_SEL + 1);
    }
  }
  if (MODE == "MENU") {
    if (event.keyCode == 13) {
      MODE = "LEVEL";
      clearScreen();
      drawLevel();
    }
  }
}

clearScreen();
drawMenu();
