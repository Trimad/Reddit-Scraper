const dotenv = require('dotenv').config();
const express = require('express');
const fs = require('fs');
const https = require('https');
const snoowrap = require('snoowrap');

const REDDIT_CLIENT_ID = process.env.clientId;
const REDDIT_CLIENT_SECRET = process.env.clientSecret;
const REDDIT_REFRESH_TOKEN = process.env.refreshToken;
const REDDIT_USER_AGENT = process.env.userAgent;

let ALPACA_API_KEY;
let ALPACA_BASE_URL;
let ALPACA_SECRET_KEY;
let DEBUG;

const PORT = 3000;
const app = express();
var posts_groomed = [];

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
}

const loadData = (path) => {
  try {
    return fs.readFileSync(path, 'utf8')
  } catch (err) {
    console.error(err)
    return false;
  }
}

app.listen(PORT, () => {
  process.argv.forEach(arg => {
    if (arg == "live") {
      DEBUG = false;
      console.log('\x1b[31m%s\x1b[0m', 'YOU ARE TRADING WITH REAL CURRENCY');  //cyan
    } else if (arg == "test" || arg == "debug" || arg == "paper") {
      DEBUG = true;
      console.log('\x1b[33m%s\x1b[0m', 'YOU ARE TRADING WITH PAPER CURRENCY');  //cyan 
    }
  });

  ALPACA_API_KEY = DEBUG ? process.env.alpaca_api_key_live : process.env.alpaca_api_key_paper;
  ALPACA_BASE_URL = DEBUG ? process.env.alpaca_base_url_live : process.env.alpaca_base_url_paper;
  ALPACA_SECRET_KEY = DEBUG ? process.env.alpaca_secret_key_live : process.env.alpaca_secret_key_paper;

});

const r = new snoowrap({
  userAgent: REDDIT_USER_AGENT,
  clientId: REDDIT_CLIENT_ID,
  clientSecret: REDDIT_CLIENT_SECRET,
  refreshToken: REDDIT_REFRESH_TOKEN
});

/*~*~*~*~*~*~*~*~*~*~**~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~**~*~*~*~**~*~
 * REDDIT API * REDDIT API * REDDIT API * REDDIT API * REDDIT API * REDDIT API
~*~*~*~*~*~*~*~*~*~**~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~**~*~*/

/*********************************
* Description: 
* Usage example: localhost:3000/subreddit/search?name=wallstreetbets&search=amc&time=day&sort=top
**********************************/
app.get('/subreddit/search', async (request, response) => {
  let rq_name = request.query.name;
  let rq_search = request.query.search;
  let rq_time = request.query.time;
  let rq_sort = request.query.sort;

  const temp = await r.getSubreddit(rq_name).search({ query: rq_search, time: rq_time, sort: rq_sort }).fetchAll();
  response.send(temp);

});

/*********************************
* Description: 
* Usage example: localhost:3000/subreddit/top?name=wallstreetbets&time=all&llimit=3
**********************************/
app.get('/subreddit/top', async (request, response) => {
  posts_groomed.splice(0, posts_groomed.length);//empty the array
  let rq_name = request.query.name;
  let rq_limit = request.query.limit;

  await r.getSubreddit(rq_name).getTop({ limit: rq_limit }).then(posts => {
    posts.forEach(post => {
      posts_groomed.push({
        link: post.url,
        title: post.title,
        id: post.id
      })
    });
  })

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

/*~*~*~*~*~*~*~*~*~*~**~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~**~*~*~*~**~*~
 * ALPACA API * ALPACA API * ALPACA API * ALPACA API * ALPACA API * ALPACA API
~*~*~*~*~*~*~*~*~*~**~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~**~*~*/

/*********************************
* Description: Gets a JSON array of all stock symbols that are tradable. 
* Usage example: localhost:3000/symbols
**********************************/
app.get('/symbols', (request, response) => {
  console.log(request.url, new Date().toLocaleString());

  const options = {
    hostname: ALPACA_BASE_URL,
    port: 443,
    path: "/v2/assets",
    method: 'GET',
    headers: {
      'APCA-API-KEY-ID': ALPACA_API_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY
    }
  }

  https.get(options, res => {
    let chunks = "";
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      chunks += chunk;
    }).on('end', () => {
      try {
        let assets = JSON.parse(chunks).filter(asset => asset.tradable);
        let symbols = [];
        assets.forEach(asset => { symbols.push(asset.symbol); });
        storeData(symbols, "data/symbols.json");
        response.send(symbols);
      } catch (e) {
        console.error(e.message);
      }
    })
  }).on('error', (e) => {
    console.error(e.message);
  })

});