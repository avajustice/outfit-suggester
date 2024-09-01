const occasionSelect = document.getElementById("occasion");
const weatherSelect = document.getElementById("weather");
const createOutfitsButton = document.getElementById("create-outfits");
const allOutfitsContainer = document.getElementById("outfits");

const menuButton = document.getElementById("hambuger");
const hamMenu = document.querySelector(".ham-nav");

const webServiceURL = "https://5a562d9d-ecb7-4661-b268-bcc1ac3ef0c2-00-2u3o7ifjw9vh1.worf.repl.co/";

// Will contain all of the objects for the articles of clothing
let itemArray = [];

let outfitArray = [];

createOutfitsButton.onclick = matchDisplayOutfits;