const dotenv = require('dotenv').config();
const express = require('express')
const snoowrap = require('snoowrap');

const REDDIT_CLIENT_ID = process.env.clientId;
const REDDIT_CLIENT_SECRET = process.env.clientSecret;
const REDDIT_REFRESH_TOKEN = process.env.refreshToken;
const REDDIT_USER_AGENT = process.env.userAgent;

let ALPACA_API_KEY;
let ALPACA_BASE_URL;
let ALPACA_SECRET_KEY;
let DEBUG;
let COMMAND = process.argv;
const PORT = 3000;
const app = express();

app.listen(PORT, () => {
  function init() {
    for (c of COMMAND) {
      console.log(c);
      if (c == "live") {
        DEBUG = false;
        console.log('\x1b[31m%s\x1b[0m', 'YOU ARE TRADING WITH REAL CURRENCY');  //cyan
      } else if (c == "test" || c == "debug" || c == "paper") {
        DEBUG = true;
        console.log('\x1b[33m%s\x1b[0m', 'YOU ARE TRADING WITH PAPER CURRENCY');  //cyan 
      }
    }
    ALPACA_API_KEY = DEBUG ? process.env.alpaca_api_key_live : process.env.alpaca_api_key_paper;
    ALPACA_BASE_URL = DEBUG ? process.env.alpaca_base_url_live : process.env.alpaca_base_url_paper;
    ALPACA_SECRET_KEY = DEBUG ? process.env.alpaca_secret_key_live : process.env.alpaca_secret_key_paper;
  }
  init();
});

const r = new snoowrap({
  userAgent: REDDIT_USER_AGENT,
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  refreshToken: REDDIT_REFRESH_TOKEN
});

var posts_groomed = [];

/*********************************
* Description: 
* Usage example: localhost:3000/subreddit/top?name=TwoSentenceHorror&time=all&llimit=2
**********************************/
app.get('/subreddit/top', async (request, response) => {
  let n = request.query.name;
  let t = request.query.time;

  const subreddit = await r.getSubreddit(n);
  const posts = await subreddit.getTop({ time: t });

  posts_groomed.splice(0, posts_groomed.length);//empty the array

  posts.forEach(post => {
    posts_groomed.push({
      link: post.url,
      title: post.title,
      id: post.id
    })
  });

  response.send(posts_groomed);

});

/*********************************
* Description: Gets an object containing the title, body, and an array of comments from a post ID.
* Usage example: localhost:3000/submission?id=m2pd90
**********************************/
app.get('/submission', async (request, response) => {
  let id = request.query.id;
  let submission = await r.getSubmission(id).fetch();
  let obj = { "title": submission.title, "selftext": submission.selftext, "comments": recurseComments(submission.comments, []) };
  response.send(obj);
  function recurseComments(comments, arr) {
    try {
      for (comment of comments) {
        arr.push(comment.body);
        if (comment.replies.length > 0) { recurseComments(comment.replies, arr); }
      }
    }
    catch (err) {
      console.log(err);
    }
    return arr;
  }
});





// function getSubmissionComments(id) {
//   let submission = r.getSubmission(id).fetch().expandReplies({ limit: 100, depth: 10 });
//   //r.getSubmission(asdf).expandReplies().then(thread => { thread.comments.forEach((comment) => whatever); });
//   return submission;
// }



//Get Subreddit Rules
app.get('/getsubredditrules', (req, res) => {
  r.getSubreddit(subreddit).getRules().then(function (response) {
    res.send(response);
  });
});

/* * *  *  *  * 
 * ALPACA API
*  *  *  *  * */
app.get('/assets', (request, response) => {
  console.log(request.url, new Date().toLocaleString());

  let url = BASE_URL + "/v2/assets";
  let req = unirest("GET", url);

  req.headers({
    "APCA-API-KEY-ID": ALPACA_API_KEY,
    "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY
  }).then((res) => {
    let assets = res.body.filter(asset => asset.tradable);
    let symbols = [];
    assets.forEach(asset => { symbols.push(asset.symbol); });
    storeData(symbols, "data/symbols.json");
    response.send(assets);
  });

});