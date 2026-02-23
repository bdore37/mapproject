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

this.value = value; // Randomized underlying value which will influence ultimate height
this.map = []; // Array of subordinate chunks
this.earth = []; // Array of earth layers
this.water = []; // Array of water layers
this.air = []; // Array of air layers
this.pressure = 0; // Vector indicating pressure

// Need to figure out how to put "neighbors" and percentage of them

this.flood = function(depth) {
   // What happens to the water layer
   this.water.push(depth);  
};
this.erode = function()  {}; // This might actually be used for all layers to simulate movement from "high" to low
this.warp = function() {}; // Maybe think of another name. Simulating continental drift

}

// -- Functions --

function generateMap() {

// Draws the map after the button is pushed

for (let r = 0; r < mapHeight; r++) {
  fullMap[r] = []; // Have to add this to tell it each new row is another array
}

for (let r = 0; r < mapHeight; r++) {
  //for (let c = 0; c < mapWidth; c++) {
  for (let c = 0; c < mapTypes.get("full")[r]; c++) {
    fullMap[r][c] = new mapChunk(prng(theSeed));
  }
}

drawMap();

}

function drawMap() {

const canvas = document.getElementById("canvas");
const d = canvas.getContext("2d");
const width = canvas.clientWidth;
const height = canvas.clientHeight;
let chunkWidth = width / mapWidth;
let chunksWide = 0;
const chunkHeight = height / mapHeight;
const hslStringA = "hsl(0, 0%, ";
const hslStringB = "%)";
let shade = "";
let hslString = "";

for (let r = 0; r < mapHeight; r++) {

  chunksWide = mapTypes.get("full")[r];
  chunkWidth = width / chunksWide;

  for (let c = 0; c < chunksWide; c++) {
    shade = Math.round(fullMap[r][c].value * 100);
    hslString = hslStringA + shade + hslStringB;
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


