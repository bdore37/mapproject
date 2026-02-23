// -- Initialize global variables --

const seedInput = document.getElementById("seed");
let theSeed = seedInput.value; // 0 < X < m
const mapWidth = 40; // Maybe irrelevant with mapType sets
const mapHeight = 20; // Maybe this becomes "size"
const fullMap = [[]]; // Multidimensional ([r][c]) array
const mapTypes = new Map();

// -- Set Up Maps Structures --

mapTypes.set("full", [3, 9, 15, 21, 26, 30, 34, 37, 39, 40, 40, 39, 37, 34, 30, 26, 21, 15, 9, 3]); // Figure out how to do this programmatically

// -- Objects --

function mapChunk(value) {

this.id = "";
this.value = value; // Randomized underlying value which will influence ultimate height
this.map = []; // Array of subordinate chunks - might be better the other way
this.earth = []; // Array of earth layers
this.water = 0; // -Array of water layers- Currently level of water
this.air = []; // Array of air layers
this.pressure = 0; // Vector indicating pressure

this.neighbors = []; // All chunks touching this one

this.flood = function(depth) {
// What happens to the water layer
  this.water += depth;
  if (this.water < 0) this.water = 0;
};

this.drain = function() {
// This drains the water layer, forming rivers and pools, causing erotion
  let thisSurface = this.value + this.water;
  let lowestSurface = thisSurface;
  let nextSurface = thisSurface;
  let tempSurface = 0;
  let tempChunk = {};
  let recipientChunk = {};
  let drainAmount = 0;

  if (this.water > 0) {
    for (let l = 0; l < this.neighbors.length; l++) {
      tempChunk = this.neighbors[l];
      tempSurface = tempChunk.value + tempChunk.water;
      if (tempSurface < lowestSurface) {
        lowestSurface = tempSurface;
        recipientChunk = tempChunk;
      }
    }
    for (let l = 0; l < this.neighbors.length; l++) {
      tempChunk = this.neighbors[l];
      tempSurface = tempChunk.value + tempChunk.water;
      if (tempSurface > lowestSurface) {
        if(tempSurface < nextSurface) nextSurface = tempSurface;
      }
    }
    drainAmount = nextSurface - lowestSurface;
    if (drainAmount > this.water) drainAmount = this.water;
    if (nextSurface === thisSurface) drainAmount = drainAmount / 2;
    if (nextSurface < thisSurface) {
      this.water = this.water - drainAmount;
      recipientChunk.water = recipientChunk.water + drainAmount;
    }
  }
};

this.erode = function()  {}; // This might actually be used for all layers to simulate movement from "high" to low
this.warp = function() {}; // Maybe think of another name. Simulating continental drift

}

// -- Functions --

function assignNeighbors() {
// This has to be done after all the mapChunks are created

let neighbor = {};
let neighbors = [];
let maxCols = 0;
let neighborCols = 0;
let min = 0;
let max = 0;

for (let r = 0; r < mapHeight; r++) {

  maxCols = mapTypes.get("full")[r];

  for (let c = 0; c < maxCols; c++) {

    neighbors.length = 0;

    // Left neighbor
    if (c === 0) {
      neighbor = fullMap[r][maxCols - 1];
    } else {
      neighbor = fullMap[r][c - 1];
    }
    neighbors.push(neighbor);

    // Right neighbor
    if (c === (maxCols - 1)) {
      neighbor = fullMap[r][0];
    } else {
      neighbor = fullMap[r][c+1];
    }
    neighbors.push(neighbor);

    min = c / maxCols;
    max = (c + 1) / maxCols;

    // Top neighbors
    if (r > 0) {
      neighborCols = mapTypes.get("full")[r - 1];
      for (let n = Math.floor(neighborCols * min); n < Math.ceil(neighborCols * max); n++) {
        neighbors.push(fullMap[r - 1][n]);
      }
    }

    // Bottom neighbors
    if (r < (mapHeight - 1)) {
      neighborCols = mapTypes.get("full")[r + 1];
      for (let n = Math.floor(neighborCols * min); n < Math.ceil(neighborCols * max); n++) {
        neighbors.push(fullMap[r + 1][n]);
      }
    }

    for (let l = 0; l < neighbors.length; l++) {
      fullMap[r][c].neighbors.push(neighbors[l]);
    }
  }
}

}

function floodAll() {
// Add water to entire map

for (let r = 0; r < mapHeight; r++) {
  for (let c = 0; c < mapTypes.get("full")[r]; c++) {
    fullMap[r][c].water = 0.33;
  }
}

// FIX THIS!!
for (let i = 0; i < 100000; i++) {
  let rnd = Math.round(prng(theSeed) * 507);
  if (rnd < 3) {
    fullMap[0][2 - rnd].drain();
  } else if (rnd < 12) {
    fullMap[1][11 - rnd].drain();
  } else if (rnd < 27) {
    fullMap[2][26 - rnd].drain();
  } else if (rnd < 48) {
    fullMap[3][47 - rnd].drain();
  } else if (rnd < 74) {
    fullMap[4][73 - rnd].drain();
  } else if (rnd < 104) {
    fullMap[5][103 - rnd].drain();
  } else if (rnd < 138) {
    fullMap[6][137 - rnd].drain();
  } else if (rnd < 175) {
    fullMap[7][174 - rnd].drain();
  } else if (rnd < 214) {
    fullMap[8][213 - rnd].drain();
  } else if (rnd < 254) {
    fullMap[9][253 - rnd].drain();
  } else if (rnd < 294) {
    fullMap[10][293 - rnd].drain();
  } else if (rnd < 333) {
    fullMap[11][332 - rnd].drain();
  } else if (rnd < 370) {
    fullMap[12][369 - rnd].drain();
  } else if (rnd < 404) {
    fullMap[13][403 - rnd].drain();
  } else if (rnd < 434) {
    fullMap[14][433 - rnd].drain();
  } else if (rnd < 460) {
    fullMap[15][459 - rnd].drain();
  } else if (rnd < 481) {
    fullMap[16][480 - rnd].drain();
  } else if (rnd < 496) {
    fullMap[17][495 - rnd].drain();
  } else if (rnd < 505) {
    fullMap[18][504 - rnd].drain();
  } else {
    fullMap[19][507 - rnd].drain();
  }
}
drawMap();

}

function generateMap() {
// Draws the map after the button is pushed

for (let r = 0; r < mapHeight; r++) {
  fullMap[r] = []; // Have to add this to tell it each new row is another array
}

for (let r = 0; r < mapHeight; r++) {
  for (let c = 0; c < mapTypes.get("full")[r]; c++) {
    fullMap[r][c] = new mapChunk(prng(theSeed));
    fullMap[r][c].id = "(" + r + "," + c + ")";
  }
}

assignNeighbors();

drawMap();

floodAll();

}

function drawMap() {

const canvas = document.getElementById("canvas");
const d = canvas.getContext("2d");
const width = canvas.clientWidth;
const height = canvas.clientHeight;
let chunkWidth = width / mapWidth;
let chunksWide = 0;
const chunkHeight = height / mapHeight;
const hslStringA = "hsl(200, ";
const hslStringB = "%, ";
const hslStringC = "%)";
let shade = "";
let saturation = "";
let hslString = "";

for (let r = 0; r < mapHeight; r++) {

  chunksWide = mapTypes.get("full")[r];
  chunkWidth = width / chunksWide;

  for (let c = 0; c < chunksWide; c++) {
    saturation = Math.round(fullMap[r][c].water * 100);
    shade = 50// Math.round(fullMap[r][c].value * 100);
    hslString = hslStringA + saturation + hslStringB + shade + hslStringC;
    d.fillStyle = hslString;
    d.fillRect(c * chunkWidth, r * chunkHeight, (c + 1) * chunkWidth, (r + 1) * chunkHeight);
  }
}

}

function prng(seed) {

// Mixed congruential (pseudorandom number) generator

let modulus = 2147483647; // 2^31 - 1 or m > 0
let multiplier = 215506; // 0 < a < m
let increment = 915772; // 0 <= c < m
let result = 0;

result = (theSeed * multiplier + increment) % modulus;
theSeed = result;
result = result / modulus;

return result;

}


