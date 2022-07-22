const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, getPostById, updatePost} = require('../db')
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
  console.log(postData)

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  let autor = req.user.id
  // let butor = autor[0].tags
  console.log(autor,'req.user test');

  try {
    postData.title = title
    postData.content = content
    postData.authorId = req.user.id
    console.log({postData})
    // add authorId, title, content to postData object
    const post = await createPost(postData);
    // this will create the post and the tags for us
    console.log(post)
    if(post){
    res.send( post );}
    next({
      name: "IncorrectCredentialsError",
      message: "Username or password is incorrect",
    });
    // otherwise, next an appropriate error object 
  } catch ({ name, message }) {
    next({ name, message });
  }
});
postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot update a post that is not yours",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });

      res.send({ post: updatedPost });
    } else {
      // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
      next(post ? { 
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours"
      } : {
        name: "PostNotFoundError",
        message: "That post does not exist"
      });
    }

  } catch ({ name, message }) {
    next({ name, message })
  }
});

postsRouter.get('/', async (req, res) => {
    try {
      const allPosts = await getAllPosts();

      const posts = allPosts.filter(post => {
        return post.active || (req.user && post.author.id === req.user.id);
      });
  
    res.send({posts});
    } catch ({name, messagge}) {
      next ({name, message })
    }
});

module.exports = postsRouter;
//curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm4iOiJhbGJlcnQiLCJpYXQiOjE2NTg0MTc2NzR9.HXWCvXN2WubBOwautyL1tE-TyNxn01mQ1o15cUJgGls'
//curl http://localhost:3000/api/posts -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm4iOiJhbGJlcnQiLCJpYXQiOjE2NTg0MjM0NzR9.T1xqEx4EKtbrx9pSz-8m9pVUrkhAiPa7Y0ZIC2DaK_8' -H 'Content-Type: application/json' -d '{"title": "test post", "content": "how is this?", "tags": " #once #twice    #happy"}'
//curl http://localhost:3000/api/posts/3 -X PATCH -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm4iOiJhbGJlcnQiLCJpYXQiOjE2NTg0MjM0NzR9.T1xqEx4EKtbrx9pSz-8m9pVUrkhAiPa7Y0ZIC2DaK_8' -H 'Content-Type: application/json' -d '{"title": "updating my old stuff", "tags": "#oldisnewagain"}'
//curl http://localhost:3000/api/posts/1 -X DELETE -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbGJlcnQiLCJpYXQiOjE2NTg1MDY0MDh9.OBlwgV7FNN6tRjd6wDN-goDybUjtzyeIxxPiE4s-EGs'