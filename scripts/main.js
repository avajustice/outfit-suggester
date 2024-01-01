(function(){
    const itemsListContainer = document.getElementById("items-list");
    const viewItemContainer = document.getElementById("view-item");
    const selectorsTitle = document.getElementById("selectors-title");
    const newItemContainer = document.getElementById("new-item");
    const nameSelect = document.getElementById("name");
    const typeSelect = document.getElementById("type");
    const colorSelect = document.getElementById("color");
    const shortLongSelect = document.getElementById("short-long");
    const patternedSelect = document.getElementById("patterned");
    const availableSelect = document.getElementById("available");
    const washSelect = document.getElementById("wash");
    const numberSelect = document.getElementById("number");
    const lastWornSelect = document.getElementById("last-worn");
    const createItemButton = document.getElementById("create-item");
    const form = document.getElementById("upload");
    const file = document.getElementById("file");
    const occasionSelect = document.getElementById("occasion");
    const weatherSelect = document.getElementById("weather");
    const createOutfitsButton = document.getElementById("create-outfits");
    const newItemImageContainer = document.getElementById("new-item-img");
    const allOutfitsContainer = document.getElementById("outfits");
    let imageFilePath = "";

    // Will contain all of the objects for the articles of clothing
    let itemArray = [];

    let outfitArray = [];

    // Need to modify these later
    let updateItemButton;
    let cancelEditingButton;

    // Set to true if a new picture has just been uploaded
    let newPictureAdded = false;

    // Should always be set to the base 64 represenation of the most recently added and resized image
    let currentImageData;
    // Should always be set to the file extension of the most recently resized image
    let currentImageFileExtension;

    async function retrieveDisplayItemsFromDatabase() {
        const rawResponse = await fetch('https://outfit-suggester-service.avajustice.repl.co/api/items', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        // An array of javascript objects is returned
        const responseItemArray = await rawResponse.json();

        for (const item of responseItemArray)
        {
            createItemObject(item.name, item.clothingType, item.color, item.shortLong,
                item.patterned, item.available, item.washType, item.number, item.lastWorn, item.id,
                item.imgId);
        }

    }

    // Item objects represent each article of clothing
    function Item(name, clothingType, color, shortLong, patterned, available, washType, number, lastWorn, id, imgId) {
        this.name = name;
        this.clothingType = clothingType;
        this.color = color;
        this.shortLong = shortLong;
        this.patterned = patterned;
        this.available = available;
        this.number = number;
        this.washType = washType;
        this.lastWorn = lastWorn;
        this.id = id;
        this.imgId = imgId;
        this.imgPath = 'https://outfit-suggester-service.avajustice.repl.co/images/' + imgId;

        this.displayItemCard = function() {
            // Create the item card container
            this.itemCard = document.createElement("div");
            this.itemCard.class = "card";
            viewItemContainer.appendChild(this.itemCard);

            // Create button to remove the item card from the viewItemContainer
            this.closeButton = document.createElement("button");
            this.closeButton.textContent = "x";
            this.closeButton.onclick = () => {
                this.itemCard.remove();
            }
            this.itemCard.append(this.closeButton);

            // Create button to delete an item from the database
            this.deleteButton = document.createElement("button");
            this.deleteButton.textContent = "Delete Item";
            this.deleteButton.onclick = () => {
                this.deleteItemFromDatabase();
                deleteImageFromDatabase(this.imgId);
                this.itemCard.remove();
                const index = itemArray.indexOf(this);
                itemArray.splice(index, 1);
                this.itemButton.remove();
            }
            this.itemCard.append(this.deleteButton);

            // Create button to edit an item
            this.editButton = document.createElement("button");
            this.editButton.textContent = "Edit";
            this.editButton.onclick = () => {
                this.editItem();
            }
            this.itemCard.append(this.editButton);

            // Create item info paragraph and image and fill in information
            this.itemInfo = document.createElement("p");
            this.itemCard.append(this.itemInfo);
            this.image = document.createElement("img");
            this.itemCard.append(this.image);
            this.updateItemCard();
        }

        this.updateItemCard = function() {
            // Update item card with relavent information

            this.itemInfo.textContent = "Name: " + this.name + "\nType of Clothing: "
             + this.clothingType + "\nColor: " + this.color + "\nShort/Long: "
             + this.shortLong + "\nVery Patterned: " + this.patterned + "\nCurrently Avaliable: "
             + this.available + "\nWash Type: " + this.washType + "\nNumber of this Item: "
             + this.number + "\nLast Worn: " + this.lastWorn;
            this.image.src = this.imgPath;

            // If the item has been worn before, calculate and display how
            // many days it has been since the item was last worn
            if (this.lastWorn != "") {
                this.daysSinceWorn = findDaysAgo(this.lastWorn);
                this.itemInfo.textContent += (" (" + this.daysSinceWorn +
                 " days ago)");
            }
        }

        this.editItem = function() {
            // Change the Add New Item section to Edit Item

            // Edit title and fill in selectors with current item information
            selectorsTitle.textContent = "Edit Clothing Item";
            nameSelect.value = this.name;
            typeSelect.value = this.clothingType;
            colorSelect.value = this.color;
            shortLongSelect.value = this.shortLong;
            patternedSelect.value = this.patterned;
            availableSelect.value = this.available;
            washSelect.value = this.washType;
            numberSelect.value = this.number;
            lastWornSelect.value = this.lastWorn;
            let img = document.createElement("img");
            img.src = this.imgPath;
            newItemImageContainer.appendChild(img);

            // Reset to false to track whether or not the image is replaced
            newPictureAdded = false;

            // Hide and disable createItemButton
            createItemButton.style.visibility = "hidden";
            createItemButton.disabled = true;

            // Create update button
            updateItemButton = document.createElement("button");
            updateItemButton.textContent = "Update";
            updateItemButton.onclick = () => {
                this.updateItem();
            }
            newItemContainer.append(updateItemButton);

            // Create cancel button
            cancelEditingButton = document.createElement("button");
            cancelEditingButton.textContent = "Cancel";
            cancelEditingButton.onclick = () => {
                resetNewItemContainerPostEditing();
            }
            newItemContainer.append(cancelEditingButton);
        }

        this.updateItem = async function() {
            // Updates the item object and the item in the database with the cuurent
            // selector values
            // Resets the New Item Container and updates the item card information

            // Set item attributes to the current selctor values
            this.name = nameSelect.value;
            this.clothingType = typeSelect.value;
            this.color = colorSelect.value;
            this.shortLong = shortLongSelect.value;
            this.patterned = patternedSelect.value;
            this.available = availableSelect.value;
            this.washType = washSelect.value;
            this.number = numberSelect.value;
            this.lastWorn = lastWornSelect.value;

            if (newPictureAdded) {
                // Delete past image
                deleteImageFromDatabase(this.imgId);

                // Add new image to database and update the item's image ID and path
                const newImgId = await addImageToDatabase(currentImageData);
                this.imgId = newImgId;
                this.imgPath = 'https://outfit-suggester-service.avajustice.repl.co/images/' + this.imgId;
            }

            this.updateItemInDatabase();
            resetNewItemContainerPostEditing();

            // Update the item card and button to show that the edit was successful
            this.updateItemCard();
            this.itemButton.textContent = this.name;
        }

        this.addItemToDatabase = async function() {
            // Sends a POST request to outfit-suggester-service on Replit, which
            // adds the clothing item to the database also on Replt
            const rawResponse = await fetch('https://outfit-suggester-service.avajustice.repl.co/api/items', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"name" : this.name, "clothingType" : this.clothingType,
                    "color" : this.color, "shortLong" : this.shortLong, "patterned" : this.patterned,
                    "available" : this.available, "washType" : this.washType, "number" : this.number,
                    "lastWorn" : this.lastWorn, "id" : this.id, "imgId" : this.imgId})
            });
            const response = await rawResponse.json();

            // Return the ID created by the service
            return response.id;
        }

        this.deleteItemFromDatabase = async function() {
            // Sends a DELETE request to outfit-suggester-service on Replit, which
            // removes the clothing item from the database also on Replt
            const itemURL = 'https://outfit-suggester-service.avajustice.repl.co/api/items/' + this.id;
            const rawResponse = await fetch(itemURL, {
                method: 'DELETE'
            });
        }

        this.updateItemInDatabase = async function() {
            // Sends a PUT request to outfit-suggester-service on Replit, which
            // modifies the clothing item to the database also on Replt
            const rawResponse = await fetch('https://outfit-suggester-service.avajustice.repl.co/api/items/' + this.id, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"name" : this.name, "clothingType" : this.clothingType,
                    "color" : this.color, "shortLong" : this.shortLong, "patterned" : this.patterned,
                    "available" : this.available, "washType" : this.washType, "number" : this.number,
                    "lastWorn" : this.lastWorn, "id" : this.id, "imgId" : this.imgId})
            });
        }

        this.createItemInformationButton = function() {
        // Creates a button with the name of the clothing item and add to
        // itemsListContainer
            this.itemButton = document.createElement("button");
            this.itemButton.textContent = this.name;
            // When the button is clicked, show the item information card
            this.itemButton.onclick = () => {
                this.displayItemCard();
            }
            itemsListContainer.append(this.itemButton);
            itemsListContainer.append('\n');
        }
    }

    addNewItem = async function(name, type, color, shortLong, patterned, available, wash, number, lastWorn) {
        // Use this function when creating a completely NEW item from the item editor
        // Creates a new item object and adds it to the database

        const imgId = await addImageToDatabase(currentImageData);

        // 0 is a placeholder for the ID until the ID is generated by the service
        const item = createItemObject(name, type, color, shortLong, patterned, available, wash, number, lastWorn, 0, imgId);

        const id = await item.addItemToDatabase();
        item.id = id;
        item.updateItemInDatabase(name, type, color, shortLong, patterned, available, wash, number, lastWorn, id, imgId);

        resetNewItemContainer();

        // Display the item card to show that the creation was successful
        item.displayItemCard();
    }

    function createItemObject(name, type, color, shortLong, patterned, available, wash, number, lastWorn, id, imgId) {
        // Creates a new Item object, add item to itemArray
        // Use without addNewItem() when creating an object for an item that has already
        // been added to database, like when reloading the page

        const item = new Item(name, type, color, shortLong, patterned, available, wash, number, lastWorn, id, imgId);
        item.createItemInformationButton();
        itemArray.push(item);
        return item;
    }

    function readPicturePath(event) {
        // Read the path of the submitted picture

        // To stop the picture from being added over and over, set a flag
        newPictureAdded = false;

        // Stop the form from reloading the page
        event.preventDefault();

        // If there is no file, do nothing
	    if (!file.value.length) {
            return;
        }

        // Create a new FileReader() object
	    let reader = new FileReader();

        // Set up the callback event to run when the file is read
	    reader.onload = addPictureToItem;

	    // Read the file
	    reader.readAsDataURL(file.files[0]);
    }

    function addPictureToItem(event) {
        // Remove old picture from screen and add new picture to item object
        imageFilePath = event.target.result;
        if (newItemImageContainer.hasChildNodes()) {
            newItemImageContainer.firstChild.remove();
        }
        let img = document.createElement("img");
        img.src = imageFilePath;

        // Wait until image is loaded before resizing
        img.addEventListener('load', function() {
            // Make sure this is the first time you are adding the picture
            if (newPictureAdded == false) {
                img.src = resizeImage(img);
                newItemImageContainer.appendChild(img);
                newPictureAdded = true;
                currentImageData = img.src;
                const beginningIndex = currentImageData.indexOf("image/");
                const fileExtensionAndOn = currentImageData.substring(beginningIndex + 6);
                const splitImgData = fileExtensionAndOn.split(";");
                currentImageFileExtension = splitImgData[0];
            }
        });
    }

    function resizeImage(img) {
        // Resize image to store it in the database

        // Create an off-screen canvas
        var canvas = document.createElement ('canvas'),
            ctx = canvas.getContext ('2d');

        // All of my pictures are 3000 x 4000
        let width = 150;   // 3000 / 20
        let height = 200;  // 4000 / 20

        // Set its dimension to target size
        canvas.width = width;
        canvas.height = height;

        // Draw source image into the off-screen canvas
        ctx.drawImage (img, 0, 0, width, height);

        // Encode image to data-url with base64 version of compressed image
        return canvas.toDataURL();
    }

    addImageToDatabase = async function(imgData) {
        // Sends a POST request to outfit-suggester-service on Replit, which
        // adds the image to the Replit filesystem
            const rawResponse = await fetch('https://outfit-suggester-service.avajustice.repl.co/api/images', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"imgData" : imgData, 'fileExtension' : currentImageFileExtension})
            });
            const response = await rawResponse.json();

            // Return the ID generated by the service
            return response.id;
        }

    deleteImageFromDatabase = async function(id) {
        // Sends a DELETE request to outfit-suggester-service on Replit, which
        // deletes the image with the specified ID from the Replit filesystem
        const rawResponse = await fetch('https://outfit-suggester-service.avajustice.repl.co/api/images/' + id, {
            method: 'DELETE'
        });
    }

    function resetNewItemContainer() {
        // Set all inputs to default and remove picture
        nameSelect.value = "";
        typeSelect.value = "Shirt";
        colorSelect.value = "White";
        shortLongSelect.value = "Short";
        washSelect.value = "Regular";
        lastWornSelect.value = "";
        newItemImageContainer.firstChild.remove();
    }

    function resetNewItemContainerPostEditing() {
        // Set all inputs to default and display and enable correct buttons
        resetNewItemContainer();
        selectorsTitle.textContent = "Add Clothing Items";
        createItemButton.style.visibility = "visible";
        createItemButton.disabled = false;
        updateItemButton.remove();
        cancelEditingButton.remove();
    }

    function findDaysAgo(pastDate) {
        // Given a date, calulate and return how many days ago that date was

        const today = new Date();
        const past = new Date(pastDate);

        // Finds the number of milliseconds between dates
        const timeDifference = today.getTime() - past.getTime();

        // Divide by the number of milliseconds in a day
        const dayDifference = Math.floor(timeDifference / 86400000);
        return dayDifference;
    }

    // Outfit objects represent a combination of clothing items
    function Outfit(name, top, bottom, lastWornAverage) {
        this.name = name;
        this.top = top;
        this.bottom = bottom;
        this.lastWornAverage = lastWornAverage;

        this.displayOutfitCard = function() {
            this.outfitContainer = document.createElement("div");

            // Add header to show the name of the outfit
            this.outfitTitle = document.createElement("h3");
            this.outfitTitle.textContent = this.name;
            this.outfitContainer.append(this.outfitTitle);

            // Add text to show when the items were last worn
            this.lastWornAverageText = document.createElement("p");
            this.lastWornAverageText.textContent = "Average Days Since Worn: " + lastWornAverage;
            this.outfitContainer.append(this.lastWornAverageText);

            // Insert line break to outfit
            this.outfitContainer.append(document.createElement("br"));
            // Add top/dress image to outfit
            this.topImage = document.createElement("img");
            this.topImage.src = top.imgPath;
            this.outfitContainer.append(this.topImage);

            // Insert line break
            this.outfitContainer.append(document.createElement("br"));
            // Add pants/skirt image
            this.bottomImg = document.createElement("img");
            this.bottomImg.src = bottom.imgPath;
            this.outfitContainer.append(this.bottomImg);

            // Insert line break
            this.outfitContainer.append(document.createElement("br"));

            // Add wear outfit button
            this.wearOutfitButton = document.createElement("button");
            this.wearOutfitButton.textContent = "Wear Outfit";
            this.wearOutfitButton.onclick = () => {
                // Find today's date
                const d = new Date();
                const date = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
                // Update the dress/top's last worn date
                this.top.lastWorn = date;
                this.top.updateItemInDatabase();
                // Update the bottom's last worn date
                this.bottom.lastWorn = date;
                this.bottom.updateItemInDatabase();
            }
            this.outfitContainer.append(this.wearOutfitButton);

            // Add the whole outfit info card to the allOutfitsContainer
            allOutfitsContainer.appendChild(this.outfitContainer);
        }
    }

    function matchDisplayOutfits() {
        // Pair allowed items into outfits based on clothing type

        // Empty outfit array and outfits container
        outfitArray = [];
        while (allOutfitsContainer.hasChildNodes()) {
            allOutfitsContainer.firstChild.remove();
        }

        // Find allowed items based on conditions
        let allowedItemsArray = filterItems();

        // Separate clothing types into different arrays
        let topsArray = allowedItemsArray.filter(item =>
         (item.clothingType == "Shirt") || (item.clothingType == "Dress"));
        let bottomsArray = allowedItemsArray.filter(item =>
         ((item.clothingType == "Pants") || (item.clothingType == "Skirt")
          || (item.clothingType == "Althelic Pants")
          || (item.clothingType == "Leggings")));

        // Match tops with bottoms
        for (const top of topsArray) {
            for (const bottom of bottomsArray) {
                // Make sure that the colors, types, and patterns of the two items match
                if ((colorsMatch(top, bottom))
                 && (patternsMatch(top, bottom))
                 && typesMatch(top, bottom)){
                    // Find the average of the two last worn dates
                    const lastWornAverage = (findDaysAgo(top.lastWorn) +
                    findDaysAgo(bottom.lastWorn)) / 2;
                    // Create a joint name
                    const name = top.name + " and " + bottom.name
                    // Create a new outfit object and add it to the outfit array
                    const outfit = new Outfit(name, top, bottom, lastWornAverage);
                    outfitArray.push(outfit);
                }
            }
        }

        // Sort by decending lastWornAverage to show least recently worn outfits first
        outfitArray.sort(function(a, b){return b.lastWornAverage - a.lastWornAverage});

        for (const outfit of outfitArray) {
            // Display all the outfit information
            outfit.displayOutfitCard();
        }
    }

    function colorsMatch(top, bottom) {
        // Determine if the colors of the top and bottom go together

        // Dresses have special rules because you ideally don't see
        // the slip shorts
        if (top.clothingType == "Dress" && bottom.shortLong == "Short") {
            console.log(top.name + " " + bottom.name);
            if (top.color == "Pink" || top.color == "White") {
                if (bottom.color != "Tan") {
                    // If the dress color is pink or white, the slip
                    // shorts cannot be any color but tan
                    return false;
                } else {
                    // If the dress color is pink or white and the slip
                    // shorts are tan, that is acceptable
                    return true;
                }
            } else {
                // If the dress color is not pink or white, any slip
                // shorts will do
                return true;
            }
        } else {
            // All other types have their own rules
            if (bottom.color === "Blue" || isNeutralColor(bottom)) {
                return true;
            } else if (bottom.color === "Pink") {
                if (isNeutralColor(top) || top.color === "Green" ||
                 top.color === "Blue") {
                    return true;
                } else {
                    return false;
                }
            } else if (bottom.color === "Red") {
                if (isNeutralColor(top)) {
                    return true;
                } else {
                    return false;
                }
            } else if (bottom.color === "Orange") {
                if (isNeutralColor(top) || top.color === "Yellow") {
                    return true;
                } else {
                    return false;
                }
            } else if (bottom.color === "Yellow") {
                if (isNeutralColor(top) || top.color === "Blue" ||
                 top.color == "Pink") {
                    return true;
                } else {
                    return false;
                }
            } else if (bottom.color === "Green") {
                if (isNeutralColor(top) || top.color === "Blue" ||
                 top.color == "Purple" || top.color == "Pink") {
                    return true;
                } else {
                    return false;
                }
            } else if (bottom.color === "Purple") {
                if (isNeutralColor(top) || top.color === "Blue" ||
                 top.color == "Green") {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    function isNeutralColor(item) {
        if (item.color == "White" || item.color == "Grey" ||
         item.color == "Black" || item.color == "Tan") {
             return true;
         } else {
             return false;
         }
    }

    function patternsMatch(top, bottom) {
        // Determine if a top and botton are both very patterened, and
        // therefore would not go with each other

        if (top.patterned == "Yes" && bottom.patterned == "Yes") {
            return false;
        } else {
            return true;
        }
    }


    function typesMatch(top, bottom) {
        // All dresses must be paired with leggings, but
        // no other type should
        if (top.clothingType == "Dress") {
            if (bottom.clothingType == "Leggings") {
                return true;
            } else {
                return false;
            }
        } else {
            if (bottom.
                clothingType == "Leggings") {
                return false;
            } else {
                return true;
            }
        }
    }

    function filterItems() {
        // Filter current list of items based on weather and occasion
        // return array of filtered items

        allowedItemsArray = itemArray;

        // Find current occasion and weather selections
        const occasion = occasionSelect.value;
        const weather = weatherSelect.value;

        // Filter based on weather
        if (weather == "Hot") {
            allowedItemsArray = allowedItemsArray.filter(item =>
             item.shortLong == "Short");
        } else if (weather == "Cold") {
            allowedItemsArray = allowedItemsArray.filter(item =>
             item.shortLong == "Long");
        } else if (weather == "Moderate") {
            allowedItemsArray = allowedItemsArray.filter(isGoodForModerateWeather);
        }

        // Filter based on occasion
        if (occasion == "Church") {
            allowedItemsArray = allowedItemsArray.filter(item =>
                (isGoodForChurch(item)));
        } else if (occasion == "Exercise") {
            allowedItemsArray = allowedItemsArray.filter(item =>
                (isGoodForExercise(item)));
        }

        return allowedItemsArray;
    }

    function isGoodForModerateWeather(item) {
        // Select long bottoms, short tops, and all leggings
        if (item.clothingType == "Pants" || item.clothingType == "Skirt" 
         || item.clothingType == "Dress") {
            return item.shortLong == "Long";
        } else if (item.clothingType == "Shirt") {
            return item.shortLong == "Short";
        } else if (item.clothingType == "Leggings") {
            return true;
        }
    }

    function isGoodForChurch(item) {
        // Dresses and skirts are always good for church
        if (item.clothingType == "Dress") {
            return true;
        } else if (item.clothingType == "Skirt") {
            return true;
        // I only wear pants and long sleeve tops to church, not short
        } else if (item.clothingType == "Shirt") {
            if (item.shortLong == "Long") {
                return true;
            } else {
                return false;
            }
        } else if (item.clothingType == "Pants") {
            if (item.shortLong == "Long") {
                return true;
            } else {
                return false;
            }
        // Everything else (althelic pants) is bad for church
        } else {
            return false;
        }
    }

    function isGoodForExercise(item) {
        // I only wear short sleeves and shorts to exercise, not
        // long sleeves or pants
        if (item.clothingType == "Shirt") {
            if (item.shortLong == "Short") {
                return true;
            } else {
                return false;
            }
        } else if (item.clothingType == "Pants") {
            if (item.shortLong == "Short") {
                return true;
            } else {
                return false;
            }
        // Atheletic pants are okay, though
        } else if (item.clothingType == "Athletic Pants") {
            return true;
        } else {
            return false;
        }
    }

    // Get items from the database every time the page is loaded
    retrieveDisplayItemsFromDatabase();

    // Uses the current values of the text boxes / drop down menus to create new item
    createItemButton.addEventListener('click', function(){
        addNewItem(nameSelect.value, typeSelect.value, colorSelect.value,
            shortLongSelect.value, patternedSelect.value, availableSelect.value,
            washSelect.value, numberSelect.value, lastWornSelect.value);
    });

    createOutfitsButton.onclick = matchDisplayOutfits;
    form.addEventListener("submit", readPicturePath);
})();