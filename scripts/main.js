(function(){
    // Header
    const goClosetButtonHeader = document.getElementById("closet-nav-header");
    const goOutfitsButtonHeader = document.getElementById("outfits-nav-header");
    const goWashButtonHeader = document.getElementById("wash-nav-header");
    const goHistoryButtonHeader = document.getElementById("history-nav-header");

    // Body
    const bodyExceptHeader = document.getElementById("body-except-header");

    // Items list
    const itemsTitle = document.getElementById("items-title");
    const itemsListContainer = document.getElementById("items-list");
    const clothesCategoryButtons = document.getElementsByClassName("clothes-category-button");
    const shortSleeveContainer = document.getElementById("ss-container");
    const longSleeveContainer = document.getElementById("ls-container");
    const shortsContainer = document.getElementById("shorts-container");
    const pantsContainer = document.getElementById("pants-container");
    const skirtsContainer = document.getElementById("skirts-container");
    const dressContainer = document.getElementById("dress-container");
    const leggingsContainer = document.getElementById("leggings-container");
    const switchClosetModeButton = document.getElementById("switch-closet-mode");

    // View item
    const viewItemContainer = document.getElementById("view-item");
    const viewItemButtonsContainer = document.getElementById("view-item-buttons-container");
    const viewItemImgAndInfo = document.getElementById("view-item-info-img-container");
    const viewImage = document.getElementById("view-item-img");
    const viewName = document.getElementById("v-name");
    const viewType = document.getElementById("v-type");
    const viewLength = document.getElementById("v-length");
    const viewColor = document.getElementById("v-color");
    const viewPatterened = document.getElementById("v-patterned");
    const viewWash = document.getElementById("v-wash");
    const viewNumber = document.getElementById("v-number");
    const viewAvailable = document.getElementById("v-available");
    const viewWorn = document.getElementById("v-worn");
    const viewDaysAgo = document.getElementById("v-days-ago");

    // New / edit item
    const selectorsTitle = document.getElementById("selectors-title");
    const newItemContainer = document.getElementById("new-item");
    const nameSelect = document.getElementById("name");
    const typeSelect = document.getElementById("type");
    const colorSelect = document.getElementById("color");
    const shortLongButtons = document.getElementsByName("length");
    const patternedButtons = document.getElementsByName("patterned");
    const availableSelect = document.getElementById("available");
    const washButtons = document.getElementsByName("wash");
    const numberSelect = document.getElementById("number");
    const lastWornSelect = document.getElementById("last-worn");
    const createItemButton = document.getElementById("create-item");
    const form = document.getElementById("upload");
    const file = document.getElementById("file");
    const newItemImageContainer = document.getElementById("new-item-img");

    // Outfits
    const allOutfitsContainer = document.getElementById("outfits");
    const outfitsTitle = document.getElementById("outfits-title");
    const outfitsBody = document.getElementById("outfits-body");
    const occasionButtons = document.getElementsByName("occasion");
    const weatherButtons = document.getElementsByName("weather");
    const createOutfitsButton = document.getElementById("create-outfits");
    const outfitCheck = document.getElementById("outfit-check");
    const loadingSymbol = document.getElementById("loading");

    // Wash
    const washTitle = document.getElementById("wash-title");
    const washContainer = document.getElementById("wash-container");
    const washRegularButton = document.getElementById("wash-regular");
    const washDelicateButton = document.getElementById("wash-delicate");
    const regularCheck = document.getElementById("regular-check");
    const delicateCheck = document.getElementById("delicate-check");

    // History
    const historyTitle = document.getElementById("history-title");
    const historyContainer = document.getElementById("history-container");
    const historyText = document.getElementById("history-text");
    const previousWeekHistoryButton = document.getElementById("previous-week-history");
    const historyStartDateSelect = document.getElementById("history-date");
    const updateHistoryButton = document.getElementById("update-history");
    
    // Hamburger menu
    const menuButton = document.getElementById("hambuger");
    const hamMenu = document.querySelector(".ham-nav");
    const goClosetButton = document.getElementById("closet-nav");
    const goOutfitsButton = document.getElementById("outfits-nav");
    const goWashButton = document.getElementById("wash-nav");
    const goHistoryButton = document.getElementById("history-nav");

    // Constants
    const webServiceURL = "https://5a562d9d-ecb7-4661-b268-bcc1ac3ef0c2-00-2u3o7ifjw9vh1.worf.repl.co/";
    let imageFilePath = "";
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

    // True if a new picture has just been uploaded
    let newPictureAdded = false;

    // The item buttons will be created if the closet page is selected
    let itemButtonsCreated = false;

    // True when first short sleeve shirt info is shown in the viewItemContainer
    let itemDisplayed = false;

    // True when the item lists and viewItemContainer are visible
    // False when the add / edit item selectors are visible
    let viewClosetMode = true;

    // Will contain all of the objects for the articles of clothing
    let itemArray = [];

    let outfitArray = [];

    // Need to modify these later
    let updateItemButton;
    let cancelEditingButton;

    // Should always be set to the base 64 represenation of the most recently added and resized image
    let currentImageData;
    // Should always be set to the file extension of the most recently resized image
    let currentImageFileExtension;

    // Create a new date representing today
    let historyStartDate = new Date();

    function hideAll() {
        // Hide all the elements on the page except for the header
        itemsTitle.style.display = "none";
        itemsListContainer.style.display = "none";
        viewItemContainer.style.display = "none";
        selectorsTitle.style.display = "none";
        newItemContainer.style.display = "none";
        outfitsTitle.style.display = "none";
        outfitsBody.style.display = "none";
        washTitle.style.display = "none";
        washContainer.style.display = "none";
        historyTitle.style.display = "none";
        historyContainer.style.display = "none";
        switchClosetModeButton.style.display = "none";
    }

    function displayClosetPage() {
        // Call when switching from a different page to the closet page

        // Display only the view item elements
        hideAll();
        itemsTitle.style.display = "block";
        viewItemContainer.style.display = "block";
        itemsListContainer.style.display = "block";
        switchClosetModeButton.style.display = "block";

        if (!itemButtonsCreated) {
            // Make buttons for all current items and put them in
            // the correct containers
            for (let item of itemArray) {
                createDisplayItemButton(item);
            }
            itemButtonsCreated = true;
        }

        // Collapse menu
        if (menuButton.classList.contains("is-active")) {
            toggleHamburgerMenu();
        }

        // Display the first short sleeve shirt so there isn't an empty box
        let i = 0;
        while(!itemDisplayed) {
            if (itemArray[i].clothingType == "Shirt" && itemArray[i].shortLong == "Short") {
                itemArray[i].displayItemCard();
                itemDisplayed = true;
            }
            i++;
        }

        viewClosetMode = true;
    }

    function displayViewItems() {
        // Call when switching from closet add / edit mode to
        // view items mode

        selectorsTitle.style.display = "none";
        newItemContainer.style.display = "none";

        itemsTitle.style.display = "block";
        viewItemContainer.style.display = "block";
        itemsListContainer.style.display = "block";

        switchClosetModeButton.textContent = "Add Items";
        viewClosetMode = true;
    }

    function displayAddEditItem() {
        // Call when switching from closet view mode to 
        // add / edit mode

        itemsTitle.style.display = "none";
        viewItemContainer.style.display = "none";
        itemsListContainer.style.display = "none";

        selectorsTitle.style.display = "block";
        newItemContainer.style.display = "block";

        switchClosetModeButton.textContent = "View Items";
        viewClosetMode = false;
    }

    function displayOutfitsPage() {
        // Display only the outfit elements
        hideAll();
        outfitsTitle.style.display = "block";
        outfitsBody.style.display = "grid";
        
        // Collapse menu
        if (menuButton.classList.contains("is-active")) {
            toggleHamburgerMenu();
        }
    }

    function displayWashPage() {
        // Display only the wash elements
        hideAll();
        washTitle.style.display = "block";
        washContainer.style.display = "grid";

        // Collapse menu
        if (menuButton.classList.contains("is-active")) {
            toggleHamburgerMenu();
        }
    }

    function displayHistoryPage() {
        // Display only the history elements
        hideAll();
        historyTitle.style.display = "block";
        historyContainer.style.display = "block";
        
        // Collapse menu
        if (menuButton.classList.contains("is-active")) {
            toggleHamburgerMenu();
        }
    }

    async function retrieveItemsFromDatabase() {
        const rawResponse = await fetch(webServiceURL + 'api/items/', {
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
                item.imgId, item.bannedPairs);
        }

        // Show that retrieval is complete by removing the loading symbol
        loadingSymbol.style.display = "none";
    }

    // Item objects represent each article of clothing
    function Item(name, clothingType, color, shortLong, patterned, available, 
         washType, number, lastWorn, id, imgId, bannedPairs) {
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
        this.bannedPairs = bannedPairs;
        this.imgPath = webServiceURL + 'images/' + imgId;

        this.displayItemCard = async function() {
            // Empty out the view item container if it already is showing
            // an item
            while (viewItemButtonsContainer.hasChildNodes()) {
                viewItemButtonsContainer.firstChild.remove();
            }

            // Create button to edit an item
            this.editButton = document.createElement("button");
            this.editButton.textContent = "Edit";
            this.editButton.className = "view-item-button";
            this.editButton.onclick = () => {
                this.editItem();
            }
            viewItemButtonsContainer.append(this.editButton);

            // Create wear button
            wearItemButton = document.createElement("button");
            wearItemButton.textContent = "Wear";
            wearItemButton.className = "view-item-button";

            // If there are none of the item available, make the color light to
            // show you can't wear it, and disable it
            if (this.available == 0) {
                wearItemButton.style.backgroundColor = "rgb(251, 240, 255)";
                wearItemButton.disabled = true;
            }

            wearItemButton.onclick = async () => {
                // Disable button so that the user will see that wearing was successful
                wearItemButton.disabled = true;
                wearItemButton.style.backgroundColor = "rgb(251, 240, 255)";
                await wearItem(this);
                await resetHistory();
                this.updateItemCard();
            }

            viewItemButtonsContainer.append(wearItemButton);

            // Create button to delete an item from the database
            this.deleteButton = document.createElement("button");
            this.deleteButton.textContent = "Delete";
            this.deleteButton.className = "view-item-button";
            this.deleteButton.onclick = () => {
                this.deleteItemFromDatabase();
                deleteImageFromDatabase(this.imgId);
                const index = itemArray.indexOf(this);
                itemArray.splice(index, 1);
                this.itemButton.remove();

                // Display the first short sleeve shirt so there isn't an empty box
                itemDisplayed = false;
                let i = 0;
                while(!itemDisplayed) {
                    if (itemArray[i].clothingType == "Shirt" && itemArray[i].shortLong == "Short") {
                        itemArray[i].displayItemCard();
                        itemDisplayed = true;
                    }
                    i++;
                }

            }
            viewItemButtonsContainer.append(this.deleteButton);

            this.updateItemCard();
        }

        this.updateItemCard = function() {
            // Update item card with relavent information

            viewName.textContent = this.name;
            viewType.textContent = this.clothingType;
            viewLength.textContent = this.shortLong;
            viewColor.textContent = this.color;
            viewPatterened.textContent = this.patterned;
            viewWash.textContent = this.washType;
            viewNumber.textContent = this.number;
            viewAvailable.textContent = this.available;
            viewWorn.textContent = this.lastWorn;

            viewImage.src = this.imgPath;

            // If the item has been worn before, calculate and display how
            // many days it has been since the item was last worn
            if (this.lastWorn != "") {
                this.daysSinceWorn = findDaysAgo(this.lastWorn);
                viewDaysAgo.textContent = (" (" + this.daysSinceWorn +
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
            availableSelect.value = this.available;
            numberSelect.value = this.number;
            lastWornSelect.value = addZerosToDate(this.lastWorn);

            // Switch item modes
            displayAddEditItem();

            // Fill in radio buttons
            for (button of shortLongButtons) {
                if (button.value == this.shortLong) {
                    button.checked = true;
                } else {
                    button.checked = false;
                }
            }
            for (button of patternedButtons) {
                if (button.value == this.patterned) {
                    button.checked = true;
                } else {
                    button.checked = false;
                }
            }
            for (button of washButtons) {
                if (button.value == this.washType) {
                    button.checked = true;
                } else {
                    button.checked = false;
                }
            }

            // Add image
            let img = document.createElement("img");
            img.src = this.imgPath;
            newItemImageContainer.appendChild(img);

            // Reset to false to track whether or not the image is replaced
            newPictureAdded = false;

            // Hide and disable createItemButton
            createItemButton.style.display = "none";
            createItemButton.disabled = true;

            // Create update button
            updateItemButton = document.createElement("button");
            updateItemButton.textContent = "Update";
            updateItemButton.id = "update-item-button";
            updateItemButton.onclick = () => {
                this.updateItem();
                resetNewItemContainerPostEditing();

                // Switch item modes
                displayViewItems()
            }
            newItemContainer.append(updateItemButton);

            // Create cancel button
            cancelEditingButton = document.createElement("button");
            cancelEditingButton.textContent = "Cancel";
            cancelEditingButton.id = "cancel-editing-button";
            cancelEditingButton.onclick = () => {
                resetNewItemContainerPostEditing();

                // Switch item modes
                displayViewItems();
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
            this.available = availableSelect.value;
            this.number = numberSelect.value;
            this.lastWorn = lastWornSelect.value;
            // Get values from radio buttons
            for (let button of shortLongButtons) {
                if (button.checked) {
                    shortLong = button.value;
                }
            }
            for (let button of patternedButtons) {
                if (button.checked) {
                    patterned = button.value;
                }
            }
            for (let button of washButtons) {
                if (button.checked) {
                    washType = button.value;
                }
            }

            if (newPictureAdded) {
                // Delete past image
                deleteImageFromDatabase(this.imgId);

                // Add new image to database and update the item's image ID and path
                const newImgId = await addImageToDatabase(currentImageData);
                this.imgId = newImgId;
                this.imgPath = webServiceURL + 'images/' + this.imgId;
            }

            this.updateItemInDatabase();
            resetNewItemContainerPostEditing();

            // Switch item modes
            displayViewItems();

            // Update the item card and button to show that the edit was successful
            this.updateItemCard();
            this.itemButton.textContent = this.name;
        }

        this.addItemToDatabase = async function() {
            // Sends a POST request to outfit-suggester-service on Replit, which
            // adds the clothing item to the database also on Replt
            const rawResponse = await fetch(webServiceURL + 'api/items', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"name" : this.name, "clothingType" : this.clothingType,
                    "color" : this.color, "shortLong" : this.shortLong, "patterned" : this.patterned,
                    "available" : this.available, "washType" : this.washType, "number" : this.number,
                    "lastWorn" : this.lastWorn, "id" : this.id, "imgId" : this.imgId, 
                    "bannedPairs" : this.bannedPairs})
            });
            const response = await rawResponse.json();

            // Return the ID created by the service
            return response.id;
        }

        this.deleteItemFromDatabase = async function() {
            // Sends a DELETE request to outfit-suggester-service on Replit, which
            // removes the clothing item from the database also on Replt
            const itemURL = webServiceURL + 'api/items/' + this.id;
            const rawResponse = await fetch(itemURL, {
                method: 'DELETE'
            });
        }

        this.updateItemInDatabase = async function() {
            // Sends a PUT request to outfit-suggester-service on Replit, which
            // modifies the clothing item to the database also on Replt
            const rawResponse = await fetch(webServiceURL + 'api/items/' + this.id, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"name" : this.name, "clothingType" : this.clothingType,
                    "color" : this.color, "shortLong" : this.shortLong, "patterned" : this.patterned,
                    "available" : this.available, "washType" : this.washType, "number" : this.number,
                    "lastWorn" : this.lastWorn, "id" : this.id, "imgId" : this.imgId, 
                    "bannedPairs" : this.bannedPairs})
            });
        }

        this.createItemInformationButton = function() {
        // Creates a button with the name of the clothing item
            this.itemButton = document.createElement("button");
            this.itemButton.textContent = this.name;
            this.itemButton.className = "item-button";

            // When the button is clicked, show the item information card
            this.itemButton.onclick = () => {
                this.displayItemCard();
            }

            // Return the button so that it can be added to the correct
            // item list
            return this.itemButton;
        }
    }

    addNewItem = async function(name, type, color, shortLong, patterned, available, 
         wash, number, lastWorn) {
        // Use this function when creating a completely NEW item from the item editor
        // Creates a new item object and adds it to the database

        const imgId = await addImageToDatabase(currentImageData);

        // 0 is a placeholder for the ID until the ID is generated by the service
        const item = createItemObject(name, type, color, shortLong, patterned, available, 
         wash, number, lastWorn, 0, imgId, []);

        const id = await item.addItemToDatabase();
        item.id = id;
        item.updateItemInDatabase(name, type, color, shortLong, patterned, available,
         wash, number, lastWorn, id, imgId, []);

        resetNewItemContainer();

        // Display the item card to show that the creation was successful
        item.displayItemCard();

        // Also, add the button to display the item card to the correct container
        createDisplayItemButton(item);
    }

    function createItemObject(name, type, color, shortLong, patterned, available, wash, 
         number, lastWorn, id, imgId, bannedPairs) {
        // Creates a new Item object, add item to itemArray
        // Use without addNewItem() when creating an object for an item that has already
        // been added to database, like when reloading the page

        const item = new Item(name, type, color, shortLong, patterned, available, wash, 
         number, lastWorn, id, imgId, bannedPairs);
        itemArray.push(item);
        return item;
    }

    function createDisplayItemButton(item) {
        // Create a button for the item and add it to the correct
        // item container based on clothing type
        let button = item.createItemInformationButton();
        if (item.clothingType == "Shirt") {
            if (item.shortLong == "Short") {
                shortSleeveContainer.append(button);
            } else {
                longSleeveContainer.append(button);
            }
        } else if (item.clothingType == "Pants" || item.clothingType == "Athletic Pants") {
            if (item.shortLong == "Short") {
                shortsContainer.append(button);
            } else {
                pantsContainer.append(button);
            }
        } else if (item.clothingType == "Dress") {
            dressContainer.append(button);
        } else if (item.clothingType == "Skirt") {
            skirtsContainer.append(button);
        } else {
            leggingsContainer.append(button);
        }
    }

    getItemFromDatabase = async function(id) {
        // Sends a GET request to outfit-suggester-service on Replit, which gets the
        // item information from the database
        const rawResponse = await fetch(webServiceURL + 'api/items/' + id, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        let response;

        // If the item cannot be retrieved from the database return "Failed"
        try {
            response = await rawResponse.json();
        } catch (error) {
            response = "Failed";
        }

        // All the item information (name, clothingType, color, shortLong, patterned, available, 
        // washType, number, lastWorn, id, imgId, bannedPairs) stored in the database
        return response;
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
            const rawResponse = await fetch(webServiceURL + 'api/images', {
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
        const rawResponse = await fetch(webServiceURL + 'api/images/' + id, {
            method: 'DELETE'
        });
    }

    addDateToDatabase = async function(date, itemIDs) {
        // Sends a POST request to outfit-suggester-service on Replit, which
        // adds the date to the database also on Replt
        const rawResponse = await fetch(webServiceURL + 'api/dates', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"id" : "0", "date" : date, "itemIDs" : itemIDs})
        });
        const response = await rawResponse.json();

        // Return the date data now stored in the database
        return response;
    }

    updateDateInDatabase = async function(id, date, itemIDs) {
        // Sends a PUT request to outfit-suggester-service on Replit, which
        // modifies the clothing item to the database also on Replt
        const rawResponse = await fetch(webServiceURL + 'api/dates/' + id, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"id" : id, "date" : date, "itemIDs" : itemIDs})
        });
        const response = await rawResponse.json();

        // Return the date data now stored in the database
        return response;
    }

    getDateFromDatabase = async function(id) {
        // Sends a PUT request to outfit-suggester-service on Replit, which
        // modifies the clothing item to the database also on Replt
        const rawResponse = await fetch(webServiceURL + 'api/dates/' + id, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        let response;

        // If the date cannot be retrieved from the database (likely it does not exist yet)
        // return "Failed"
        try {
            response = await rawResponse.json();
        } catch (error) {
            response = "Failed";
        }

        return response;
    }

    function resetNewItemContainer() {
        // Set all inputs to default and remove picture
        nameSelect.value = "";
        typeSelect.value = "Shirt";
        colorSelect.value = "White";
        for (button of shortLongButtons) {
            if (button.id == "short") {
                button.checked = true;
            } else {
                button.checked = false;
            }
        }
        for (button of patternedButtons) {
            if (button.id == "not-patterned") {
                button.checked = true;
            } else {
                button.checked = false;
            }
        }
        for (button of washButtons) {
            if (button.id == "regular") {
                button.checked = true;
            } else {
                button.checked = false;
            }
        }
        lastWornSelect.value = "";
        numberSelect.value = "";
        availableSelect.value = "";
        newItemImageContainer.firstChild.remove();

        // Display and enable createItemButton
        createItemButton.style.display = "block";
        createItemButton.disabled = false;
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

    function addZerosToDate(date) {
        // Change dates into the format YYYY-MM-DD from YYYY-M-D, YYYY-MM-D, etc.
        let dateParts = date.split("-");
        if (dateParts[1].length == 1) {
            dateParts[1] = "0" + dateParts[1];
        }
        if (dateParts[2].length == 1) {
            dateParts[2] = "0" + dateParts[2];
        }
        return dateParts[0] + "-" + dateParts[1] + "-" + dateParts[2];
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

        this.wearOutfit = async function() {

            await wearItem(top);
            await wearItem(bottom);
            
            // Clear the outfit container because probably the user isn't going to wear two outfits of
            // the same type in one day
            allOutfitsContainer.replaceChildren();

            // Also make the check hidden
            outfitCheck.style.display = "none";

            await resetHistory();
        }

        this.displayOutfitCard = function() {
            this.outfitContainer = document.createElement("div");
            this.outfitContainer.className = "outfit-container";

            // Add header to show the name of the outfit
            this.outfitTitle = document.createElement("h3");
            this.outfitTitle.textContent = this.name;
            this.outfitContainer.append(this.outfitTitle);

            // Add text to show when the items were last worn
            this.lastWornAverageText = document.createElement("p");
            this.lastWornAverageText.textContent = "Average Days Since Worn: " + lastWornAverage;
            this.outfitContainer.append(this.lastWornAverageText);

            // Create container for lower half of outfit card
            this.outfitImagesAndButtons = document.createElement("div");
            this.outfitImagesAndButtons.className = "outfit-images-buttons";
            this.outfitContainer.append(this.outfitImagesAndButtons);

            // Create container for outfit images
            this.outfitImagesContainer = document.createElement("div");
            this.outfitImagesContainer.className = "outfit-images";
            this.outfitImagesAndButtons.append(this.outfitImagesContainer);

            // Insert line break to outfit
            this.outfitContainer.append(document.createElement("br"));
            // Add top/dress image to outfit
            this.topImage = document.createElement("img");
            this.topImage.src = top.imgPath;
            this.outfitImagesContainer.append(this.topImage);

            // Insert line break
            this.outfitImagesContainer.append(document.createElement("br"));
            // Add pants/skirt image
            this.bottomImg = document.createElement("img");
            this.bottomImg.src = bottom.imgPath;
            this.outfitImagesContainer.append(this.bottomImg);

            // Insert line break
            this.outfitContainer.append(document.createElement("br"));

            // Create container for outfit buttons
            this.outfitButtonsContainer = document.createElement("div");
            this.outfitButtonsContainer.className = "outfit-buttons";
            this.outfitImagesAndButtons.append(this.outfitButtonsContainer);

            // Add wear outfit button
            this.wearOutfitButton = document.createElement("button");
            this.wearOutfitButton.textContent = "Wear";
            this.wearOutfitButton.className = "wear-outfit-button";
            this.wearOutfitButton.onclick = () => {
                // Find the coordinates of the top image
                const topImgRect = this.topImage.getBoundingClientRect();
                // The check should be further down the page so that it overlaps
                // both the top and bottom image
                const checkTopCoordinate = topImgRect.top + 150;
                // Set the new location for the check
                outfitCheck.style.top = checkTopCoordinate + "px";
                // Make it visible
                outfitCheck.style.display = "block";
                // Wait for one second to show the check, then call wear outfit
                setTimeout(this.wearOutfit, 1000);
            }
            this.outfitButtonsContainer.append(this.wearOutfitButton);

            // Insert line break between buttons 
            this.outfitButtonsContainer.append(document.createElement("br"));

            // Add ban outfit button
            this.banOutfitButton = document.createElement("button");
            this.banOutfitButton.textContent = "Don't Make Again";
            this.banOutfitButton.onclick = () => {
                this.top.bannedPairs.push(this.bottom.id);
                this.top.updateItemInDatabase();
            }
            this.outfitButtonsContainer.append(this.banOutfitButton);

            // Add the whole outfit info card to the allOutfitsContainer
            allOutfitsContainer.appendChild(this.outfitContainer);
        }
    }

    async function wearItem(item) {
        // Find today's date
        // This includes seconds and other extra information
        const d = new Date();
        // Convert to the format YYYY-(M)M-(D)D
        const date = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();

        // Update the item's last worn date and availability
        item.lastWorn = date;
        item.available--;
        await item.updateItemInDatabase();

        databaseDate = await getDateFromDatabase("date-" + date);

        if (databaseDate == "Failed") {
            // If the date cannot be retrieved, create a new date
            await addDateToDatabase(date, [item.id]);
        } else {
            // Otherwise, add the id of item to the list of ids for the date
            itemIDs = databaseDate.itemIDs;
            itemIDs.push(item.id);
            await updateDateInDatabase(databaseDate.id, databaseDate.date, itemIDs);
        }

        if (item.washType == "Regular") {
            // Once you wear a regular item, make the regular wash check disappear to
            // show that the regular clothes are no longer all clean
            regularCheck.style.display = "none";
        } else {
            // Once you wear a delicate item, make the delicate wash check disappear to
            // show that the delicate clothes are no longer all clean
            delicateCheck.style.display = "none";
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
         ((item.clothingType == "Pants") 
          || (item.clothingType == "Skirt")
          || (item.clothingType == "Athletic Pants")
          || (item.clothingType == "Leggings")));

        // Match tops with bottoms
        for (const top of topsArray) {
            for (const bottom of bottomsArray) {
                // Make sure that the colors, types, and patterns of the two items match
                if ((colorsMatch(top, bottom))
                 && (patternsMatch(top, bottom))
                 && typesMatch(top, bottom)
                 && !isBanned(top, bottom)){
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
            if (bottom.clothingType == "Leggings") {
                return false;
            } else {
                return true;
            }
        }
    }

    function isBanned(top, bottom) {
        for (const id of top.bannedPairs) {
            if (id == bottom.id) {
                return true;
            }
        }
        // If you've made it through all the banned IDs without returning true, it
        // must not be banned
        return false;
    }

    function filterItems() {
        // Filter current list of items based on weather and occasion
        // return array of filtered items

        allowedItemsArray = itemArray;

        // Find current occasion selection
        let occasion;
        for (let button of occasionButtons) {
            if (button.checked) {
                occasion = button.value;
            }
        }

        // Filter based on availability
        allowedItemsArray = allowedItemsArray.filter(item => item.available > 0);

        // Filter based on occasion
        if (occasion == "Church") {
            allowedItemsArray = allowedItemsArray.filter(item =>
                (isGoodForChurch(item)));
            allowedItemsArray = filterBasedOnWeather(allowedItemsArray);
        } else if (occasion == "Exercise") {
            allowedItemsArray = allowedItemsArray.filter(item =>
                (isGoodForExercise(item)));
            // Don't filter based on weather for exercise because I don't want to
            // exercise in long sleeves, even if it's cold
        } else {
            allowedItemsArray = allowedItemsArray.filter(item =>
                (isGoodForOtherOccation(item)));
            allowedItemsArray = filterBasedOnWeather(allowedItemsArray);
        }

        return allowedItemsArray;
    }

    function filterBasedOnWeather(allowedItemsArray) {
        // Get current weather value from radio buttons
        let weather;
        for (let button of weatherButtons) {
            if (button.checked) {
                weather = button.value;
            }
        }

        // Filter items based on weather
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
        } else if (item.clothingType == "Shirt") {
            // I wear both long and short sleeve shirts to church
            return true;
        } else if (item.clothingType == "Pants") {
            // I only wear pants to church, not shorts
            if (item.shortLong == "Long") {
                return true;
            } else {
                return false;
            }
        } else if (item.clothingType == "Leggings") {
            // Leggings are good for church, with skirts and dresses
            return true;
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

    function isGoodForOtherOccation(item) {
        // I only wear athletic pants when exercising
        if(item.clothingType == "Athletic Pants") {
            return false;
        } else {
            return true;
        }
    }

    function washRegular() {
        // Make unavailable regular items available
        for (const item of itemArray) {
            if (item.available != item.number && item.washType == "Regular") {
                item.available = item.number;
                item.updateItemInDatabase();
            }
        }

        // Show the check to indicate success
        regularCheck.style.display = "block";
    }

    function washDelicate() {
        for (const item of itemArray) {
            if (item.available != item.number && item.washType == "Delicate") {
                item.available = item.number;
                item.updateItemInDatabase();
            }
        }

        // Show the check to indicate success
        delicateCheck.style.display = "block";
    }

    async function getDisplayWeekHistory() {

        // Show the past week
        for (i = 0; i < 7; i++) {
            // Get the information about the current day from the database
            const dateYMD = historyStartDate.getFullYear() + "-" + (historyStartDate.getMonth() + 1) + "-" + historyStartDate.getDate();
            const dateID = "date-" + dateYMD;
            const dateData = await getDateFromDatabase(dateID);

            // Add the date to the displayed history
            const day = dayNames[historyStartDate.getDay()];
            const month = monthNames[historyStartDate.getMonth()];
            const dayNumber = historyStartDate.getDate();
            // Should be in the format "\nMonday, January 1: "
            const dateText = document.createElement("p");
            dateText.textContent = '\n\n' + day + ", " + month + " " + dayNumber + ": ";
            dateText.style.fontWeight = "bold";
            dateText.className = "history-date-text";
            historyText.append(dateText);

            // Create container to hold all the item names for a particular date
            const itemNamesContainer = document.createElement("div");
            itemNamesContainer.id = "item-names-container";
            historyText.append(itemNamesContainer);

            if (dateData != "Failed") {
                const itemIDs = dateData.itemIDs;

                // Loop through all items for a date, except for the last
                for (let i = 0; i < itemIDs.length - 1; i++) {
                    // Get the item information from the database
                    const item = await getItemFromDatabase(itemIDs[i]);

                    // Add item name to the item names container
                    const itemText = document.createElement("p");
                    itemText.textContent = item.name + ', ';
                    itemText.className = "history-item-text";
                    itemNamesContainer.append(itemText);
                }

                // Last item will not have a comma and space after it
                const item =  await getItemFromDatabase(itemIDs[itemIDs.length - 1]);
                const itemText = document.createElement("p");
                itemText.textContent = item.name;
                itemText.className = "history-item-text";
                itemNamesContainer.append(itemText);

            } else {
                // If there are no items worn on a date, add "None" to the 
                // item names container
                const noneText = document.createElement("p");
                noneText.textContent = "None";
                noneText.className = "history-item-text";
                itemNamesContainer.append(noneText);
            }

            // Subtract milliseconds in a day to get the previous day
            historyStartDate = new Date(historyStartDate.getTime() - (24 * 60 * 60 * 1000));
        }
    }

    async function displayHistoryAfterDateSelect() {
        // Get the date from the date selector
        historyStartDate = new Date(historyStartDateSelect.value);

        // Oddly enough, historyStartDate is at 20:00 on the previous day, so we need to add 
        // four hours worth of milliseconds to get it to the next day
        historyStartDate = new Date(historyStartDate.getTime() + 4 * 60 * 60 * 1000);

        // Clear the history displayed so that the requested history is easily seen
        while (historyText.hasChildNodes()) {
            historyText.firstChild.remove();
        }
        
        getDisplayWeekHistory();
    }

    async function resetHistory() {
        // Reset historyStartDate to today and redisplay the history
        // to show the new change in the history
        historyStartDate = new Date();
        while (historyText.hasChildNodes) {
            historyText.removeChild();
        }
        // historyText.textContent = ""
        getDisplayWeekHistory(); 
    }

    function createItem() {
        // Uses the current values of the text boxes / drop down menus / radio buttons 
        // to create new item

        // Get current values of radio buttons
        let currentShortLong;
        let currentPatterned;
        let currentWashType;
        for (let button of shortLongButtons) {
            if (button.checked) {
                currentShortLong = button.value;
            }
        }
        for (let button of patternedButtons) {
            if (button.checked) {
                currentPatterned = button.value;
            }
        }
        for (let button of washButtons) {
            if (button.checked) {
                currentWashType = button.value;
            }
        }

        addNewItem(nameSelect.value, typeSelect.value, colorSelect.value,
            currentShortLong, currentPatterned, availableSelect.value,
            currentWashType, numberSelect.value, lastWornSelect.value);

        // Switch item mode
        displayViewItems();
    }

    function toggleHamburgerMenu() {
        // Switch whether the hamburger menu is active or not
        menuButton.classList.toggle("is-active");
        hamMenu.classList.toggle("is-active");
    }

    function switchClosetMode() {
        // Toggle between view and add / edit item modes
        if (viewClosetMode) {
            displayAddEditItem();
        } else {
            displayViewItems();
        }
    }

    // Assign functions to buttons
    createItemButton.onclick = createItem;
    createOutfitsButton.onclick = matchDisplayOutfits;
    goClosetButton.onclick = displayClosetPage;
    goOutfitsButton.onclick = displayOutfitsPage;
    goWashButton.onclick = displayWashPage;
    goHistoryButton.onclick = displayHistoryPage;
    goClosetButtonHeader.onclick = displayClosetPage;
    goOutfitsButtonHeader.onclick = displayOutfitsPage;
    goWashButtonHeader.onclick = displayWashPage;
    goHistoryButtonHeader.onclick = displayHistoryPage;
    washRegularButton.onclick = washRegular;
    washDelicateButton.onclick = washDelicate;
    menuButton.onclick = toggleHamburgerMenu;
    switchClosetModeButton.onclick = switchClosetMode;

    // Add eventListeners to buttons
    previousWeekHistoryButton.addEventListener('click', function() {
        getDisplayWeekHistory();
    });

    updateHistoryButton.addEventListener('click', function() {
        // If the user doesn't select a date, but still clicks the button, 
        // don't do anything
        if (historyStartDateSelect.value != "") {
            displayHistoryAfterDateSelect();
        }
    });

    bodyExceptHeader.addEventListener('click', function() {
        // When the body is clicked while the menu is open, close the menu
        // When the menuButton is active its classList will contain "is-active"
        if (menuButton.classList.contains("is-active")) {
            toggleHamburgerMenu();
        }
    });

    for (button of clothesCategoryButtons) {
        // There are three states for clothesCategoryButtons
        // Neutral (no extra class): visible, without content displayed
        // underneath, down arrow
        // Active: visible, content displayed underneath, up arrrow
        // Hidden: not visible, no content displayed underneath
        button.addEventListener("click", function(event) {
            // event.target is the thing the event happened to

            if (event.target.classList.contains("active")) {
                // If the button is currently active, we want to hide the 
                // currently visible content
                event.target.nextElementSibling.style.maxHeight = null;
            } else {
                // Otherwise, we wan to display it
                event.target.nextElementSibling.style.maxHeight = 
                    event.target.nextElementSibling.scrollHeight + "px";
            }

            // Hide or reveal all the other buttons
            for (b of clothesCategoryButtons) {
                b.classList.toggle("hidden");
            }

            // But keep this one as it was
            event.target.classList.toggle("hidden");

            // But do switch if this button is active or not
            event.target.classList.toggle("active");
        })
    }

    form.addEventListener("submit", readPicturePath);

    // Get items from the database every time the page is loaded
    retrieveItemsFromDatabase();

    // Go ahead and get this week's history so that by the time the 
    // user navigates to that section, it will probably be ready to view
    getDisplayWeekHistory();

    // Start with outfits page
    displayOutfitsPage();
})(); 