// -- Initialize global variables --

const seedInput = document.getElementById("seed");
let theSeed = seedInput.value; // 0 < X < m

const floodDepthInput = document.getElementById("flooddepth");
const drainSwitch = document.getElementById("drain").checked;

const mapSize = 80;//document.getElementById("mapsize"); // Should be even for now
const fullMap = [[]]; // Multidimensional ([r][c]) array

// -- Set Up Maps Structures --

const mapTypes = new Map();
buildStructures();

generateMap();

// -- Objects --

function locationObj(x, y) {

this.x = x;
this.y = y;
this.z = 0;

}

function neighborObj() {

this.top = []; // Top neighbors from left to right
this.bottom = []; // Bottom neighbors from left to right
this.left = {};
this.right = {};

this.all = function() {

  let a = [];

  for (let n = 0; n < this.top.length; n++) {
    a.push(this.top[n]);
  }

  for (let n =0; n< this.bottom.length; n++) {
    a.push(this.bottom[n]);
  }

  a.push(this.left);
  a.push(this.right);

  return a;
}

}

function earthObj(start, value) {

this.type = "";
this.start = start; // Where this layer starts
this.value = value; // How deep/high this layer is

}

function mapChunk(value) {

this.id = "";
this.location = []; // x, y, z
this.value = value; // Underlying value which will influence ultimate height
this.map = []; // Array of subordinate chunks - might be better the other way
this.earth = []; // Array of earth layers
this.water = 0; // -Array of water layers- Currently level of water
this.air = []; // Array of air layers
this.pressure = 0; // Vector indicating pressure

this.neighbors = {}; // All chunks touching this one
this.neighborhood = function() {
// All chunks touching neighbors
  let temp = [];
  let members = [];

  for (let n = 0; n < this.neighbors.all().length; n++) {
    temp.push(this.neighbors.all()[n]);
  }

  for (let n = 0; n < temp.length; n++) {
    for (let m = 0; m < temp[n].neighbors.all().length; m++) {
      members.push(temp[n].neighbors.all()[m]);
    }
  }

  return members;
};

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

this.erode = function() {}; // This might actually be used for all layers to simulate movement from "high" to low
this.warp = function() {}; // Maybe think of another name. Simulating continental drift

}

// -- Functions --

function buildStructures() {
// Identifies number of columns per row for a sphere

const halfHeight = Math.round(mapSize / 2);
const colsPerRow = [];
let colsTop = 0;
let colsBottom = 0;
let cols = 0;
let rowTop = 0;
let rowBottom = 0;
let rowIncrement = 0;
let rowIndex = [];

for (let l = (halfHeight - 1); l >= 0; l--){
  rowTop = l + 1;
  rowBottom = l;
  colsTop = Math.cos(rowTop * Math.PI / 2 / halfHeight) * halfHeight * 4;
  colsBottom = Math.cos(rowBottom * Math.PI / 2 / halfHeight) * halfHeight * 4;
  cols = Math.round((colsTop + colsBottom) / 2);
  colsPerRow.push(cols);

  rowIndex.push(rowIncrement);
  rowIncrement += cols;
}

for (let l = (halfHeight - 1); l >= 0; l--){
  colsPerRow.push(colsPerRow[l]);

  rowIndex.push(rowIncrement);
  rowIncrement += colsPerRow[l];
}

mapTypes.set("full", colsPerRow);
mapTypes.set("fullRowIndex", rowIndex);

}

function assignNeighbors() {
// This has to be done after all the mapChunks are created

let neighbor = {};
let maxCols = 0;
let neighborCols = 0;
let min = 0;
let max = 0;

for (let r = 0; r < mapSize; r++) {

  maxCols = mapTypes.get("full")[r];

  for (let c = 0; c < maxCols; c++) {

    fullMap[r][c].neighbors = new neighborObj();

    // Left neighbor
    if (c === 0) {
      neighbor = fullMap[r][maxCols - 1];
    } else {
      neighbor = fullMap[r][c - 1];
    }
    fullMap[r][c].neighbors.left = neighbor;

    // Right neighbor
    if (c === (maxCols - 1)) {
      neighbor = fullMap[r][0];
    } else {
      neighbor = fullMap[r][c+1];
    }
    fullMap[r][c].neighbors.right = neighbor;

    min = c / maxCols;
    max = (c + 1) / maxCols;

    // Top neighbors
    if (r > 0) {
      neighborCols = mapTypes.get("full")[r - 1];
      for (let n = Math.floor(neighborCols * min); n < Math.ceil(neighborCols * max); n++) {
        fullMap[r][c].neighbors.top.push(fullMap[r - 1][n]);
      }
    }

    // Bottom neighbors
    if (r < (mapSize - 1)) {
      neighborCols = mapTypes.get("full")[r + 1];
      for (let n = Math.floor(neighborCols * min); n < Math.ceil(neighborCols * max); n++) {
        fullMap[r][c].neighbors.bottom.push(fullMap[r + 1][n]);
      }
    }
  }
}

}

function smooth(chunk) {
// Average value of neighborhood

let tempValue = 0;
let neighborhood = chunk.neighborhood();
let neighbors = chunk.neighbors.all();
let tempNum = 0;

for (let n = 0; n < neighborhood.length; n++) {
  tempValue += neighborhood[n].value;
}

for (let n = 0; n < neighbors.length; n++) {
  tempValue += neighbors[n].value;
  tempValue += neighbors[n].value;
}

tempNum = 2 * neighbors.length + neighborhood.length;
return tempValue / tempNum;
}

function floodAll() {
// Add water to entire map

depth = floodDepthInput.value;

for (let r = 0; r < mapSize; r++) {
  for (let c = 0; c < mapTypes.get("full")[r]; c++) {
    fullMap[r][c].flood(depth);
  }
}

drawMap();
if (drainSwitch) drainAll();

}

function drainAll(){

rowIndex = mapTypes.get("fullRowIndex");
indexMax = mapSize - 1;
drainCycles = 5;
maxChunks = rowIndex[indexMax] + mapTypes.get("full")[indexMax];

for (let i = 0; i < drainCycles; i++) {
  let rnd = Math.round(prng(theSeed) * (maxChunks - 1));

  let n = 0;
  while (rnd < rowIndex[n]) n++;
  fullMap[n][rnd - rowIndex[n]].drain();

  console.log("rnd = ", rnd, "drain: ", n, (rnd - rowIndex[n]));

}

drawMap();

}

function generateMap() {
// Draws the map after the button is pushed

theSeed = seedInput.value; // Resets to seed in prompt
let rWidth = mapTypes.get("full");

for (let r = 0; r < mapSize; r++) {
  fullMap[r] = []; // Have to add this to tell it each new row is another array
}

for (let r = 0; r < mapSize; r++) {
  for (let c = 0; c < rWidth[r]; c++) {
    fullMap[r][c] = new mapChunk(prng(theSeed));
    fullMap[r][c].id = "(" + r + "," + c + ")";
    fullMap[r][c].location = new locationObj(r, c);
  }
}

assignNeighbors();

for (let r = 0; r < mapSize; r++) {
  for (let c = 0; c < rWidth[r]; c++) {
    fullMap[r][c].earth.push(new earthObj(0, smooth(fullMap[r][c])));
  }
}

drawMap();

}

function drawMap() {

const canvas = document.getElementById("canvas");
const d = canvas.getContext("2d");
const width = canvas.clientWidth;
const height = canvas.clientHeight;

let chunkWidth = 0;
let chunksWide = 0;
const chunkHeight = height / mapSize;

const hslStringA = "hsl(200, ";
const hslStringB = "%, ";
const hslStringC = "%)";
let shade = "";
let saturation = "";
let hslString = "";

for (let r = 0; r < mapSize; r++) {

  chunksWide = mapTypes.get("full")[r];
  chunkWidth = width / chunksWide;

  for (let c = 0; c < chunksWide; c++) {
    saturation = Math.round(fullMap[r][c].water * 100);
    shade = Math.round(fullMap[r][c].earth[0].value * 100);
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


