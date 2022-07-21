const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost} = require('../db')
const { requireUser } = require("./utils")


postsRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

;

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;
  console.log(req.body, title)
  const tagArr = tags.trim().split(/\s+/);
  const postData = {}
    // authorId:'',
    // title: "",
    // content: "",
    // tags: [],
  // };
  console.log(postData)

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  let autor = req.user.posts[0].author
  // let butor = autor[0].tags
  console.log(autor,'req.user test');

  try {
    postData.title = title
    postData.content = content
    postData.authorId = req.user.posts[0].author;
    postData.tags = req.user.posts[0].tags
    console.log({postData})
    // add authorId, title, content to postData object
    const post = await createPost(postData);
    // this will create the post and the tags for us
    if(post){
    res.send({ post });}
    next({
      name: "IncorrectCredentialsError",
      message: "Username or password is incorrect",
    });
    // otherwise, next an appropriate error object 
  } catch ({ name, message }) {
    next({ name, message });
  }
});








postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();
  
    res.send({posts});
});

module.exports = postsRouter;
//curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm4iOiJhbGJlcnQiLCJpYXQiOjE2NTg0MTc2NzR9.HXWCvXN2WubBOwautyL1tE-TyNxn01mQ1o15cUJgGls'
//curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm4iOiJhbGJlcnQiLCJpYXQiOjE2NTg0MjM0NzR9.T1xqEx4EKtbrx9pSz-8m9pVUrkhAiPa7Y0ZIC2DaK_8' -H 'Content-Type: application/json' -d '{"title": "test post", "content": "how is this?", "tags": " #once #twice    #happy"}'
