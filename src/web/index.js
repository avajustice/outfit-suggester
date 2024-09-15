const dotenv = require('dotenv');
const express = require("express");
const app = express();
const fs = require('fs');
var cors = require('cors');
const { auth, requiresAuth } = require('express-openid-connect');

// Bring in settings from .env file
dotenv.config();

// Get the location for storing app data
// This location should already exist on the file system.
const dataDir = process.env.OUTFIT_DATA_DIR
console.log("Data directory is: " + dataDir);
const imageDir = dataDir + '/images';

const KvpDatabase = require('./kvpdb.js');
const db = new KvpDatabase(dataDir + '/database.sqlite');
db.init();

app.use(express.json()); // for decoding req.body
app.use(cors({ origin: '*' , methods: ['GET', 'PUT', 'POST', 'DELETE']}));
app.use(express.static(__dirname + "/public"));
app.use('/images', express.static(imageDir));

// Set up authentication
const config = {
    authRequired: false,
    auth0Logout: true
};

const port = process.env.PORT || 3000;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
    config.baseURL = `http://localhost:${port}`;
}

// The `auth` router attaches /login, /logout
// and /callback routes to the baseURL
app.use(auth(config));

// Middleware to check if the user is authenticated
function failIfNotAuthenticated(req, res, next) {
    if(!req.oidc.isAuthenticated()) {
        res.status(401).send(JSON.stringify({error: "Unauthorized"}));
    } else {
      next(); // proceed as usual
    }
}

// Set handlers for various HTTP methods
app.get("/api/items", failIfNotAuthenticated, itemsHttpGetHandler);
app.get("/api/items/:id", failIfNotAuthenticated, itemsIDHttpGetHandler);
app.post("/api/items", failIfNotAuthenticated, itemsHttpPostHandler);
// You can either delete all the data, or an item by id
app.delete("/api/items", failIfNotAuthenticated, itemsHttpDeleteHandler);
app.delete("/api/items/:id", failIfNotAuthenticated, itemsIDHttpDeleteHandler);
// PUT requests must have an id parameter
app.put("/api/items/:id", failIfNotAuthenticated, itemsHttpPutHandler);

app.get("/api/images/:id", imagesIDHttpGetHandler);
app.post("/api/images", imagesHttpPostHandler);
app.put("/api/images/:id", imagesHttpPutHandler);
app.delete("/api/images/:id", imagesIDHttpDeleteHandler);

// History
app.get("/api/dates", failIfNotAuthenticated, datesHttpGetHandler);
app.get("/api/dates/:id", failIfNotAuthenticated, datesIDHttpGetHandler);
app.post("/api/dates", failIfNotAuthenticated, datesHttpPostHandler);
app.put("/api/dates/:id", failIfNotAuthenticated, datesIDHttpPutHandler);
app.delete("/api/dates/:id", failIfNotAuthenticated, datesIDHttpDeleteHandler);
app.delete("/api/dates", failIfNotAuthenticated, datesHttpDeleteHandler);

// Profile
app.get("/api/profile", profileHttpGetHandler);

// Start us up!
app.listen(3000, () => {
  console.log("server started");
});

// Handles HTTP GET requests to /api/items
async function itemsHttpGetHandler(req, res) {
  // Get all the item values in the database

  let items = [];

  const matches = await db.list("item", req.oidc.user.sub);

  for (const key of matches) {
    const item = await db.get(key, req.oidc.user.sub); 
    items.push(item);
  }
  // Send the items
  res.send(items);
}

// Handles HTTP GET requests to /api/items/:id
async function itemsIDHttpGetHandler(req, res) {
  // Get item with specified id
  const id = req.params.id;
  const item = await db.get(id, req.oidc.user.sub); 

  // Send the item information
  res.send(item);
}

// Handles HTTP POST requests to /api/items
async function itemsHttpPostHandler(req, res) {
  const inputData = req.body;
  const id = generateItemId();
  inputData.id = id;
  // add item to the database, using its id as the key
  db.set(id, inputData, req.oidc.user.sub);
  res.send(inputData);
}

// Handles HTTP DELETE requests to /api/items/
async function itemsHttpDeleteHandler(req, res) {
  // Delete all items for the authenticated user
  await db.empty(req.oidc.user.sub);
  res.send("DELETE!");
}

// Handles HTTP DELETE requests to /api/items/:id
async function itemsIDHttpDeleteHandler(req, res) {
  // Delete item with specified id
  const id = req.params.id;
  db.delete(id, req.oidc.user.sub);
  res.send("DELETED " + id);
}

// Handles HTTP PUT requests to /api/items/:id
async function itemsHttpPutHandler(req, res) {
  // Set item with specified id equal to body of request
  const id = req.params.id;
  db.set(id, req.body, req.oidc.user.sub);
  res.send(req.body);
}

// Handles HTTP GET requests to /api/images/:id
async function imagesIDHttpGetHandler(req, res) {
  // Get item with specified id
  const id = req.params.id;

  // Send the URL of the requested image
  res.send("This is image is located at https://outfitsuggester.avajustice.com/images/" + id);
}

// Handles HTTP POST requests to /api/images
async function imagesHttpPostHandler(req, res) {
  const inputData = req.body;
  const fileExtension = inputData.fileExtension;
  const id = generateImageId(fileExtension);
  inputData.id = id;

  // Convert image from base64 to binary
  let base64Image = inputData.imgData;
  const beginningIndex = base64Image.indexOf("base64,");
  base64Image = base64Image.substring(beginningIndex + 7);
  const binaryData = Buffer.from(base64Image, 'base64');

  // Write the image to the filesystem
  fs.writeFile(imageDir + '/' + id, binaryData, 'binary', (err) => {
      if (err) {
          console.error('Error writing file:', err);
      } else {
          console.log('File saved successfully!');
      }
  });

  // Send the id
  res.send(inputData);
}

// Handles HTTP PUT requests to /api/images/:id
async function imagesHttpPutHandler(req, res) {
    const inputData = req.body;
    const id = req.params.id;
    
    // Convert image from base64 to binary
    let base64Image = inputData.imgData;
    // Unlike the POST from the client, we expect the restore
    // tool to PUT without the base64 header
    const binaryData = Buffer.from(base64Image, 'base64');
    
    // Write the image to the filesystem
    fs.writeFile(imageDir + '/' + id, binaryData, 'binary', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            res.status(500).send(JSON.stringify(err));
        } else {
            console.log('File saved successfully!');
            res.send('File saved successfully!')
        }
    });
}

async function imagesIDHttpDeleteHandler(req, res) {
  const id = req.params.id;

  // Delete image with specified ID
  fs.unlink(imageDir + '/' + id, (err) => {
      if (err) {
          console.error('Error deleting file:', err);
          res.send('Error deleting file:', err)
      } else {
          console.log('File deleted successfully!');
          res.send('File deleted successfully!')
      }
  });

}

// Handles HTTP GET requests to /api/dates/:id
async function datesIDHttpGetHandler(req, res) {
  // Get item with specified id
  const id = req.params.id;
  const date = await db.get(id, req.oidc.user.sub); 
  
  // Send the date information
  res.send(date);
}

// Handles HTTP GET requests to /api/dates
async function datesHttpGetHandler(req, res) {
  const dates = [];
  
  const datesIDs = await db.list("date", req.oidc.user.sub);

  for (const id of datesIDs) {
    const date = await db.get(id, req.oidc.user.sub);
    dates.push(date);
  }

  res.send(dates);
}

// Handles HTTP POST requests to /api/dates
async function datesHttpPostHandler(req, res) {
  const inputData = req.body;
  // The ID will be in the form "date-YYYY-MM-DD"
  const id = "date-" + inputData.date;
  inputData.id = id;
  // add item to the database, using its id as the key
  db.set(id, inputData, req.oidc.user.sub);
  res.send(inputData);
}

// Handles HTTP PUT requests to /api/dates/:id
async function datesIDHttpPutHandler(req, res) {
  // Set item with specified id equal to body of request
  console.log("PUT! " + req.body.itemIDs);
  const id = req.params.id;
  db.set(id, req.body, req.oidc.user.sub);
  res.send(req.body);
}

// Handles HTTP DELETE requests to /api/dates/:id
async function datesIDHttpDeleteHandler(req, res) {
  // Delete item with specified id
  const id = req.params.id;
  db.delete(id, req.oidc.user.sub);
  res.send("DELETED " + id);
}

// Handles HTTP DELETE requests to /api/dates
async function datesHttpDeleteHandler(req, res) {
  
  // Delete item with specified id
  const matches = await db.list("date", req.oidc.user.sub);

  for (const id of matches) {
    db.delete(id, req.oidc.user.sub);
  }

  res.send("Delete!")
}

// Handles HTTP GET requests to /api/profile
async function profileHttpGetHandler(req, res) {
    response = {
        isAuthenticated: req.oidc.isAuthenticated(),
        user: req.oidc.user ? req.oidc.user : null
    };
    res.send(JSON.stringify(response));
}

function generateItemId() {
    // Generate random ID to use as a key for the item in the database
    let id = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    id = "item-" + id;
    return id;
}

function generateImageId(fileExtension) {
    // Generate random ID to use as a key for the item in the database
    let id = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    // The ID will serve as the file name
    id = "image-" + id + "." + fileExtension;
    return id;
}
