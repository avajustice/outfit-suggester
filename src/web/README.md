# outfit-app express-auth
A project based on [avajustice's outfit-suggester](https://github.com/avajustice/outfit-suggester/) using express for client and server, with Auth0's `express-openid-connect` package.

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

## Test authentication

Login:
http://localhost:3000/login

Profile:
http://localhost:3000/profile

Logout:
http://localhost:3000/logout
