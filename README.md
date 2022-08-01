# How Late Is Wan Show

## Setting up to run locally:
* Create an app at https://dev.twitch.tv/console/apps
* Create a .env file and populate it like so:
```env
CLIENT_ID= <client id>
CLIENT_SECRET= <client secret>
ACCESS_TOKEN=None
```
* The program will automatically create new access tokens
* Create ```src/data.json``` and populate it like so:
```javascript
{
    "recordTimeLate": 0 
}
```
* Run ```npm ci``` to integrate the packages
* Run ```npm start``` and visit the site under the port ```8000```
