(function(){
    const itemsListContainer = document.getElementById("items-list");
    const viewItemContainer = document.getElementById("view-item");
    const nameSelect = document.getElementById("name");
    const typeSelect = document.getElementById("type");
    const colorSelect = document.getElementById("color");
    const shortLongSelect = document.getElementById("short-long")
    const washSelect = document.getElementById("wash");
    const lastWornSelect = document.getElementById("last-worn");
    const createItemButton = document.getElementById("create-item");
    const form = document.getElementById("upload");
    const file = document.getElementById("file");
    const occasionSelect = document.getElementById("occasion");
    const weatherSelect = document.getElementById("weather");
    const createOutfitsButton = document.getElementById("create-outfits");
    const newItemImageContainer = document.getElementById("new-item-img");
    const outfitsContainer = document.getElementById("outfits");
    let imageFilePath = "";

    // Will contain all of the objects for the articles of clothing
    let itemArray = [];

    let outfitArray = [];

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
                item.washType, item.lastWorn, item.id);
        }

    }

    // Item objects represent each article of clothing
    function Item(name, clothingType, color, shortLong, washType, lastWorn, id) {
        this.name = name;
        this.clothingType = clothingType;
        this.color = color;
        this.shortLong = shortLong;
        this.washType = washType;
        this.lastWorn = lastWorn;
        this.id = id;

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
                this.itemCard.remove();
                const index = itemArray.indexOf(this);
                itemArray.splice(index, 1);
                this.itemButton.remove();
            }
            this.itemCard.append(this.deleteButton);

            // Create item info paragraph and fill in information
            this.itemInfo = document.createElement("p");
            this.itemCard.append(this.itemInfo);
            this.updateItemCard();
        }

        this.updateItemCard = function() {
            // Update item card with relavent information

            this.itemInfo.textContent = "Name: " + this.name + "\nType of Clothing: "
             + this.clothingType + "\nColor: " + this.color + "\nShort/Long: " 
             + this.shortLong + "\nWash Type: " + this.washType + "\nLast Worn: " + this.lastWorn;
            // this.image.src = this.imgSrc;

            // If the item has been worn before, calculate and display how
            // many days it has been since the item was last worn
            if (this.lastWorn != "") {
                this.daysSinceWorn = findDaysAgo(this.lastWorn);
                this.itemInfo.textContent += (" (" + this.daysSinceWorn + 
                 " days ago)");
            }
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
                    "color" : this.color, "shortLong" : this.shortLong, "washType" : this.washType,
                    "lastWorn" : this.lastWorn})
            });

            // Delete id problem: trying to get the item information so that I can know the assigned id
            // const responseNewItem = await rawResponse.json();
            // return responseNewItem;
        }

        this.deleteItemFromDatabase = async function() {
        // Sends a DELETE request to outfit-suggester-service on Replit, which
        // removes the clothing item from the database also on Replt
            const itemURL = 'https://outfit-suggester-service.avajustice.repl.co/api/items/' + this.id;
            console.log(itemURL);
            const rawResponse = await fetch(itemURL, {
                method: 'DELETE'
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

    function addNewItem(name, type, color, shortLong, wash, lastWorn) {
        // Use this function when creating a completely new item from the item editor
        // Creates a new item object and adds it to the database

        // 0 is a placeholder id because the database has not yet assigned an id
        const item = createItemObject(name, type, color, shortLong, wash, lastWorn, 0);

        // delete item id problem: should return the item information, including id TT
        // const response = item.addItemToDatabase();
        // console.log(response);
    }

    function createItemObject(name, type, color, shortLong, wash, lastWorn, id) {
        // Creates a new Item object, add new item to Current Items list, add
        // new item to itemArray, and add new item to the database
        const item = new Item(name, type, color, shortLong, wash, lastWorn, id);
        item.createItemInformationButton();
        itemArray.push(item); 
        return item;
    }

    function handleSubmit(event) {
        // Read the path of the submitted picture

        // Stop the form from reloading the page
        event.preventDefault();

        // If there is no file, do nothing
	    if (!file.value.length) {
            return;
        }

        // Create a new FileReader() object
	    let reader = new FileReader();

        // Set up the callback event to run when the file is read
	    reader.onload = addPicture;

	    // Read the file
	    reader.readAsDataURL(file.files[0]);
    }

    function addPicture(event) {
        // Remove old picture and add new picture
        imageFilePath = event.target.result;
        if (newItemImageContainer.hasChildNodes()) {
            newItemImageContainer.firstChild.remove();
        }
        let img = document.createElement("img");
        img.src = imageFilePath;
        newItemImageContainer.appendChild(img);
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

    function matchDisplayOutfits() {
        // Pair allowed items into outfits based on clothing type

        outfitArray = [];

        // Find allowed items based on conditions
        let allowedItemsArray = filterItems(); 

        // Separate clothing types into different arrays
        let shirtsArray = allowedItemsArray.filter(item => 
         item.clothingType == "Shirt");
        let bottomsArray = allowedItemsArray.filter(item => 
         item.clothingType == ("Pants" || "Skirt"));
        let dressArray = allowedItemsArray.filter(item => 
         item.clothingType == "Dress");

        // Match shirts with bottoms
        for (const shirt of shirtsArray) {
            console.log(shirt);
            for (const bottom of bottomsArray) {
                if (colorsMatch(shirt, bottom)) {
                    const lastWornScore = (findDaysAgo(shirt.lastWorn) +
                     findDaysAgo(bottom.lastWorn)) / 2;
                    prepareToDisplayOutfit(shirt, bottom, lastWornScore);
                }
            }
        }

        // Make dresses their own outfit
        for (const dress of dressArray) {
            const lastWornScore = findDaysAgo(dress.lastWorn);
            prepareToDisplayOutfit(dress, dress, lastWornScore);
        }

        outfitArray.sort(compareLastWornScores);
        
        for (outfit of outfitArray) {
            outfitsContainer.append(outfit);
        }

    }

    function colorsMatch(shirt, bottom) {
        console.log("Matching. . .");
        console.log(bottom.color);
        console.log(shirt.color);
        if (bottom.color === "Blue" || isNeutralColor(bottom)) {
            return true;
        } else if (bottom.color === "Pink") {
            if (isNeutralColor(shirt) || shirt.color === "Green" ||
             shirt.color === "Blue") {
                return true;
            } else {
                return false;
            }
        } else if (bottom.color === "Red") {
            if (isNeutralColor(shirt)) {
                return true;
            } else {
                return false;
            }
        } else if (bottom.color === "Orange") {
            if (isNeutralColor(shirt) || shirt.color === "Yellow") {
                return true;
            } else {
                return false;
            }
        } else if (bottom.color === "Yellow") {
            if (isNeutralColor(shirt) || shirt.color === "Blue" || 
             shirt.color == "Pink") {
                return true;
            } else {
                return false;
            }
        } else if (bottom.color === "Green") {
            if (isNeutralColor(shirt) || shirt.color === "Blue" || 
             shirt.color == "Purple" || shirt.color == "Pink") {
                return true;
            } else {
                return false;
            }
        } else if (bottom.color === "Purple") {
            if (isNeutralColor(shirt) || shirt.color === "Blue" || 
             shirt.color == "Green") {
                return true;
            } else {
                return false;
            }
        }
    }

    function isNeutralColor(item) {
        if (item.color === "White" || item.color === "Grey" || 
         item.color === "Black") {
             return true;
         } else {
             return false;
         }
    }

    function compareLastWornScores(outfitA, outfitB) {
        if (outfitA.firstChild.textContent < outfitB.firstChild.textContent) {
            return 1;
        } else if (outfitA.firstChild.textContent > outfitB.firstChild.textContent) {
            return -s1;
        } else {
            return 0;
        }
    }

    function prepareToDisplayOutfit(s, b, lastWornScore) {
        // Display grouped names and pictures of items in outfits

        const shirt = s;
        const bottom = b;
        const outfit = document.createElement("div");
        // outfitsContainer.append(outfit);
        const lastWornScoreText = document.createElement("p");
        outfit.append(lastWornScoreText);
        lastWornScoreText.textContent = lastWornScore;
        const outfitTitle = document.createElement("p");
        outfit.append(outfitTitle);
        outfitArray.push(outfit);
        console.log(outfitArray);

        const wearOutfitButton = document.createElement("button");
        outfit.append(wearOutfitButton);
        wearOutfitButton.textContent = "Wear Outfit";

        // If the item is a dress, the dress if both the top and the bottom
        if (shirt === bottom) {
            outfitTitle.textContent = shirt.name;

            // When outfit is chosen, update the dress's last worn value to 
            // today's date
            wearOutfitButton.onclick = () => {
                const d = new Date();
                const date = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
                shirt.lastWorn = date;
                shirt.updateItemCard();
            }

            const dressImage = document.createElement("img");
            dressImage.src = shirt.imgSrc;
            outfit.append(dressImage);

        // If it is a two piece outfit, show both names and pictures
        } else {
            outfitTitle.textContent = shirt.name + " and " + bottom.name;

            // When outfit is chosen, update the both the top and the 
            // bottom's last worn value to today's date
            wearOutfitButton.onclick = () => {
                const d = new Date();
                const date = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
                shirt.lastWorn = date;
                bottom.lastWorn = date;
                shirt.updateItemCard();
                bottom.updateItemCard();
            }

            const shirtImage = document.createElement("img");
            shirtImage.src = shirt.imgSrc;
            outfit.append(shirtImage);
            const pantsSkirtImage = document.createElement("img");
            pantsSkirtImage.src = bottom.imgSrc;
            outfit.append(pantsSkirtImage);
        }
    }

    function filterItems() {
        // Filter current list of items based on weather and occasion
        // return array of filtered items

        // Find current occasion and weather selections
        const occasion = occasionSelect.value;
        const weather = weatherSelect.value; 
        let allowedItemsArray = itemArray;
        if (weather == "Hot") {
            allowedItemsArray = allowedItemsArray.filter(item => 
             item.shortLong == "Short");
        } else if (weather == "Cold") {
            allowedItemsArray = allowedItemsArray.filter(item => 
             item.shortLong == "Long");
        } else if (weather == "Moderate") {
            allowedItemsArray = allowedItemsArray.filter(isGoodForModerateWeather);
        }
        return allowedItemsArray;
    }

    function isGoodForModerateWeather(item) {
        // Select long bottoms and short tops
        if (item.clothingType == ("Pants" || "Skirt" || "Dress")) {
            return item.shortLong == "Long";
        } else if (item.clothingType == "Shirt") {
            return item.shortLong == "Short";
        }
    }

    // Get items from the database every time the page is loaded
    retrieveDisplayItemsFromDatabase();

    // Uses the current values of the text boxes / drop down menus to create new item
    createItemButton.addEventListener('click', function(){
        addNewItem(nameSelect.value, typeSelect.value, colorSelect.value, 
            shortLongSelect.value, washSelect.value, lastWornSelect.value);
    });

    createOutfitsButton.onclick = matchDisplayOutfits;
    form.addEventListener("submit", handleSubmit);
})();