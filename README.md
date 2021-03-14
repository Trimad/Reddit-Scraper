# Reddit-Scraper

## Getting started
1. Clone this repository.
```
git clone https://github.com/Trimad/Reddit-Scraper.git
```
2. Make sure you have [Node.js](http://nodejs.org/) installed.
3. Install [Express.js](https://expressjs.com/), [Snoowrap](https://github.com/not-an-aardvark/snoowrap) and [dotenv](https://www.npmjs.com/package/dotenv) dependencies.
```
npm i express
npm i snoowrap
npm i dotenv
```
## Setup Environment Variables
This project takes advantage of dotenv to keep environment variables private. Create a file named ".env" in your project directory and define your authentication strings. 
```
#Reddit API
userAgent=
clientId=
clientSecret=
refreshToken=

#Alpaca API Live Trading
alpaca_api_key_live=
alpaca_base_url_live=
alpaca_secret_key_live=

#Alpaca API Paper Trading
alpaca_api_key_paper=
alpaca_base_url_paper=
alpaca_secret_key_paper=
```
## Running the API
### Paper Trading
```
node reddit.js paper
```
###Live Trading
```
node reddit.js live
```
## Using the API
### Usage Examples
```
localhost:3000/subreddit/top?name=TwoSentenceHorror&time=all&llimit=2
```
```
localhost:3000/submission?id=m2pd90
```
