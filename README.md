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
### Create a file named ".env" in your project directory and populate the following authentication strings.
```
userAgent=
clientId=
clientSecret=
refreshToken=
```
## Using the API
### Usage Examples
```
localhost:3000/subreddit/top?name=TwoSentenceHorror&time=all&llimit=2
```
```
localhost:3000/submission?id=m2pd90
```
