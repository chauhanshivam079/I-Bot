## New Multi Device Whatsapp Bot

Easy deploy your bot, steps in the bottom.

**_Requirements :_**

- Heroku account
- Heroku cli
- Git

# Instructions:- :rocket:

## Git Setup

### Download and install git from (https://git-scm.com/downloads)

## Heroku Setup

1. Create account on heroku. (https://signup.heroku.com/)

2. After login on heroku dashboard create an app on heroku (https://dashboard.heroku.com/apps)

3. In the 'Resources' tab search for 'Heroku Postgres' in Add-ons and add it to your heroku app.

4. In the 'Deploy' section download Heroku CLI or from (https://devcenter.heroku.com/articles/heroku-cli#download-and-install)

## Heroku CLI

1. After downloading and installing Heroku CLI in your system login to heroku cli using `heroku login` in command prompt or powershell.
2. Add ffmpeg (_for sticker support_) in your heroku app using `heroku buildpacks:add https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git -a <your-app-name>`
3. After adding ffmpeg now add 'Heroku Buildpack for Node.js' using `heroku buildpacks:add https://github.com/heroku/heroku-buildpack-nodejs.git -a <your-app-name>`
4. Now download or clone the whatsapp-bot repo by `git clone https://github.com/chauhanshivam079/I-Bot.git`
5. Now enter in whatsapp-bot directory using `cd I-Bot` in command prompt or terminal.
6. Create the remote region using `heroku git:remote -a <your-app-name>`
7. Now push the local repo in your heroku app using `git push heroku master`
8. Now after the deploy process is completed use `heroku logs -app <your-app-name> --tail` to get real time logs from heroku app.
9. In real time logs it will automatically ask you for login using qr code just simple scan the qr code using your whatsapp web section, and you are done.

Now Bot will start working!! Work even if the device is offline!!

# Features:- :rocket:

## Default prefix : `#`

## Commands :

|  Public Commands  |          Description           | Alias |
| :---------------: | :----------------------------: | :---: |
|      `#help`      |    Display public commands     |       |
|      `#a`         |    Check bot is ON or OFF      |       |
|      `#link`      |    Get current group link      |       |
|      `#source`    |    Get the bot source          |       |
|      `#steal`     |    Change sticker name to I-Bot|       | 
|                   |    or to a name of your choice |       |

<hr>

| Member Commands |                    Description                    |  Alias   |
| :-------------: | :-----------------------------------------------: | :------: |
|    `#msgcount`  |        Know message count in current group        |   `#mc`  |
|    `#sticker`   |        Create sticker from different media types  |   `#s`   |
|    `#disable`   |        To block particular commands for group     |          |
|    `#toimg`     |        Create image from sticker                  |          |
|    `#mp3s`      |        Get any song in good quality               |          |
|    `#iprof`     |        Get insta user profile details including dp|          |
|    `#igd`       |        Get insta reels or post videos             |   `#i`   |
|    `#vs`        |        Download youtube videos                    |          |
|    `#mp3c`      |        Download youtube audio                     |          |
|    `#tagall`    |        tag all members in group                   |          |
|    `#gs`        |        to search anything on google               |          |
|    `#is`        |        to search for an image                     |          |
|    `#ps`        |        to search for an electronic products       |          |
|    `#cprice`    |        to get the price of a crypto coin          |   `#cp`  |
|    `#cnews`     |        to get the news for specific crypto coin   |   `#cn`  |
|    `#sprice`    |        to get the price of a stock                |   `#sp`  |
|    `#last_tag`  |        to get the last tagged message             |   `#lt`  |
|    `#last_tag`  |        to get the last tagged message             |   `#lt`  |
|    `#run`       |        to compile and run code in various lang    |          |

<hr>

|   Admin Commands   |                       Description                       |  Alias  |
| :----------------: | :-----------------------------------------------------: | :-----: |
|      `#add`        |                  Add member to group                    |         |
|      `#kick`       |                  kick member from group                 |         |
|      `#promote`    |                  to make member a admin in group        |         |
|      `#demote`     |                  to make admin a member in group        |         |
|      `#tagadmins`  |                  Tag all admins of group                |         |
|      `#warning`    |                  Give warning to user                   |         |
|      `#tagall`     |                  Tag all members in group               |         |

<hr>

# Note:- :rocket:

Since heroku uses:- Dyno sleeping in which if an app has a free web dyno, and that dyno receives no web traffic in a 30-minute period, it will sleep. In addition to the web dyno sleeping, the worker dyno (if present) will also sleep. and if a sleeping web dyno receives web traffic, it will become active again after a short delay (assuming your account has free dyno hours available)
You can use (http://kaffeine.herokuapp.com) to ping the heroku app every 30 minutes to prevent it from sleeping.

# References:- :rocket:

- [@Baileys](https://github.com/adiwajshing/Baileys)

# Easy way to deploy:- :rocket:

Your bot will be deployed on heroku but still you need to install heroku locally to scan QR code

1. Download Heroku CLI from [here](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)
2. Open terminal
3. Type command `heroku login` and give access
4. Type command `heroku logs -a <your-app-name> --tail`

Now you'll see QR code, scan with your device and bot will start working!
