# Outfit Suggester
Outfit Suggester is a three-tier application that suggests outfits from clothes in your wardrobe!
The client is a web app, the server uses Node.js, and the database uses SQLite. To try out the website,
go to https://outfitsuggester.avajustice.com and follow the instructions at the bottom of the README.

## Configuration
Set `webServiceURL` in `main.js` to the URL of the web service instance. By default, it points to root of the site.

## Install Node
On Ubuntu:
```
$ curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

$ sudo apt-get install -y nodejs
```

## Install App
```
$ cd src/web
$ npm install
```

## Configure environment variables
Create a `.env` file beside `index.js`. This file contains secrets and install-specific data, so it isn't checked into git. The file should contain the following...

```
OUTFIT_DATA_DIR=/var/lib/outfit-data2
CLIENT_ID={client-id}
ISSUER_BASE_URL=https://{xyz}.auth0.com
SECRET={random-long-string}
PORT=3000
```
The curly braces { } above indicate placeholder values. Don't actually include the braces in your file.

Details:
- `OUTFIT_DATA_DIR` should be the local path where you want to store the app's data.
- `CLIENT_ID` is the Auth0 Client ID value. Get it from the Auth0 dashboard.
- `ISSUER_BASE_URL` is the Auth0 Domain with an https:// prefix. Get the Domain value from the Auth0 dashboard.
- `SECRET` should be a random long string, such as one generated with `openssl rand -hex 32`. This is NOT the same as the Auth 0 Client Secret value.
- `PORT` is the port where the app will run.


## Create data directories
By default, the path is `/var/lib/outfit-data2`. If you set a different `OUTFIT_DATA_DIR` value, use that path instead in the commands below.

Ensure the folder and subfolder exist and grant access if needed:
```
$ sudo mkdir /var/lib/outfit-data2
$ sudo mkdir /var/lib/outfit-data2/images

$ sudo chown USERNAME /var/lib/outfit-data2
$ sudo chmod 700 /var/lib/outfit-data2

$ sudo chown USERNAME /var/lib/outfit-data2/images
$ sudo chmod 700 /var/lib/outfit-data2/images
```

## Run server
```
$ cd src/web
$ npm start
```

## Browse site
Go to http://localhost:3000/

## Using the site
Outfit Suggester is a work in progress, so some aspects of using the site are not self-explanatory yet.
Here is a brief tutorial to demonstrate how to get started using Outfit Suggester.

1. Go to https://outfitsuggester.avajustice.com.

2. First, create an account. Click the person icon in the righthand corner, then click the login link to 
create an account.

<img src="docs/choose_person_icon.png" width ="700">
</br>
<img src="docs/login.png" width ="700">

4. Now you need to add your clothes to the closet! Click "Closet" at the top of the screen, then click
the "Add Items" button.

<img src="docs/closet.png" width ="700">
</br>
<img src="docs/add_item.png" width ="700">

5. For each item you want to add, fill in all the fields with information about that item, then click "Create
Item." Make sure to click "Upload" after you choose your image!

<img src="docs/finish_item.png" width ="700">

6. Now you can create outfits! Click "Outfits" at the top of the screen, then choose the desired occasion and
weather before clicking "Create Outfits."

<img src="docs/outfits1.png" width ="700">

7. Click "Wear" to choose the outfit that you want to wear today. Your selection will show up under "History" 
and the items will be marked as unavailable until they are washed.

<img src="docs/wear_outfit1.png" width ="700">
</br>
<img src="docs/worn_outfit.png" width ="700">
</br>
<img src="docs/history.png" width ="700">

Note: If you want to select individual items to wear, you can choose them in the "Closet" section.

8. After you wash clothes, click on the "Wash Regular" or "Wash Delicates" dials under "Laundry"
to make the items available for creating outfits again.

<img src="docs/wash.png" width ="700">
</br>
<img src="docs/washed.png" width ="700">