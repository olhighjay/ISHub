const chalk = require('chalk');
const mongoose = require('mongoose');
const debug = require('debug')('app:postsController');
const fs = require('fs'); 

function postsController(Post, Category, User) {
  async function get(req, res, next){
    try{
        const posts = await Post.find().populate(["author", "category"]);
        // const category = await populate("category");
        console.log(posts);
        const response = {
        count: posts.length,
          posts: posts.map(post => {
            if(post.author){
              return res.status(200).json({
                Id: post.id,
                Title: post.title,
                Body: post.body,
                coverImage: post.coverImage,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                Category: post.category,
                Author: {
                  Id: post.author.id,
                  Username: post.author.username
                },
                request: {
                  type: 'GET',
                  url: 'http://localhost:4000/api/posts/' + post._id
                }
              });
            }else{
              return res.status(200).json({
                Post: post,
                request: {
                  type: 'GET',
                  url: 'http://localhost:4000/api/posts/' + post._id
                }
              });
            }
          })
        };
        res.status(200).json(response);

    }
    catch(err){
      console.log(err);
      res.status(500).json({error: err.message});
    }
  }

  async function post(req, res, next){
    // console.log(req.file);
    const id = req.body.category;
    
    try{
      const category = await Category.findById(id);
      // console.log(category);
        if(!category){
          return res.status(404).json({
            error: "Category does not exist"
          });
        }
        // console.log(req.file);
      const post = new Post({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        body: req.body.body,
        category: id
      });
      if(req.file){
        post.coverImage= req.file.path;
      }
      post.user = req.userData.userId
      await post.save();
      console.log(post);
      console.log(post.user);
      res.status(201).json({
        message: 'Post was created successfully',
        createdProduct: {
          title: post.title,
          body: post.body,
          category: post.category,
          _id: post._id,
          user: post.user,
          request: {
            type: 'GET',
            url: 'http://localhost:4000/api/posts/' + post._id
          }
        }
      });
    }
    catch(err) {
      console.log(err);
      res.status(500).json({
        error: err.message
      });
    };
    
    
  }

  async   function getPostById(req, res, next){
    const id = req.params.postId;
    try{
     
      const post = await Post.findById(id).populate(["author", "category"]);
      // .select("product quantity _id")
      // const user = populate('user');
    
        console.log("From database", post);
        if(post){
          if(post.author){
            return res.status(200).json({
              Id: post.id,
              Title: post.title,
              Body: post.body,
              coverImage: post.coverImage,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt,
              Category: post.category,
              Author: {
                Id: post.author._id,
                Username: post.author.username
              },
              request: {
                type: 'GET',
                url: 'http://localhost:4000/api/posts/' + post._id
              }             
            })
          }else{
            return res.status(200).json({
              Post: post,
              request: {
                type: 'GET',
                url: 'http://localhost:4000/api/posts/' + post._id
              }
            });
          }
        }
        else{
          res.status(404).json({
            error: "Post not found"
          });

        }
        
      
     
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.stack
      });
    }
  };

  async function updatePost(req, res){
   
    const id = req.params.postId;
    const update = req.body;
    const keysArray = Object.keys(update)
   
    try{
      const post = await Post.findById(id);
      // return res.send(catg);
      if(!post){
        return res.status(404).json({
          error: "Post not found"
        });
      }

      // Check if the category in the request is valid
      if(update.category){
        const catg = await Category.findById(update.category);
        if(!catg){
          throw new Error('Invalid category');
        }
      }
      console.log(update.author);
      // Check if the author in the request is valid
      if(update.author){
        const author = await User.findById(update.author);
        if(!author){
          throw new Error('Invalid Author');
        }
      }

      keysArray.forEach(key => {
        post[key] = update[key];
      })
      //Update cover image
      if(req.file){
        // delete the image from storage
        fs.unlink( post.coverImage, err => { 
          if(err){
            console.log(err);
          }
        });
        // upload the image from  the database
        post.coverImage = req.file.path;
      }

      await post.save();
      
      // const category = await Category.findOneAndUpdate(id, {$set: {name: req.body.newName, description: req.body.newDescription}}, {
      //   new: true
      // });
      
      res.status(201).json({
        message: "Post updated successfully",
        post: post
      });  
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.message
      });
    }
  };

  async function deletePost(req, res, next){
    const id = req.params.postId;
    try{
     
      const post = await Post.findById(id);
        if(post){
          if(post.coverImage){
            // delete the image from storage
            fs.unlink( post.coverImage, err => { 
              if(err){
                console.log(err);
              }
            });
          }
          await post.remove();
          res.status(200).json({
            message: "Post deleted successfully",
            request: {
              type: 'POST',
              description: 'Create new post', 
              url: 'http://localhost:4000/api/posts/',
              body: {
                title: 'String, required',
                body: 'String, required',
                category: 'String, required',
                coverImage: 'image, max-5mb, jpg-jpeg-png',
              }
            }
          });
        }
        else{
          res.status(404).json({
            error: "Post not found"
          });

        }
        
      
     
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.stack
      });
    }
  }

  return {
    get,
    post,
    getPostById,
    updatePost,
    deletePost
  };
}

module.exports = postsController;