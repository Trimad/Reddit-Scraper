const dotenv = require('dotenv').config();
const express = require('express')
const snoowrap = require('snoowrap');

const USER_AGENT = process.env.userAgent;
const CLIENT_ID = CLIENT_ID;
const CLIENT_SECRET = CLIENT_SECRET;
const REFRESH_TOKEN = REFRESH_TOKEN;

const hostname = '127.0.0.1';
const port = 3000;
const app = express()

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const r = new snoowrap({
  userAgent: USER_AGENT,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  refreshToken: REFRESH_TOKEN
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