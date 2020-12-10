const chalk = require('chalk');
const mongoose = require('mongoose');
const debug = require('debug')('app:postsController');

function categoriesController(Category) {
  async function get(req, res, next){
    try{
        const categories = await Category.find();
        res.status(200).json({
          count: categories.length,
          categories
        });

    }
    catch(err){
      console.log(err);
      res.status(500).json({error: err});
    }
  }

  async function post(req, res, next){
    
      try{
        const category = new Category({
          _id: new mongoose.Types.ObjectId(),
          name: req.body.name,
          description: req.body.description
        });
        await category.save();
        console.log(category);
        res.status(201).json({
          message: 'Category was created successfully',
          createdCategory: {
            category: category
          }
        });
      }
      catch(err) {
        console.log(err);
        res.status(500).json({
          error: err.stack
        });
      };
    
    
  }

  async function updateCategory(req, res, next){
    
    const id = req.params.categoryId;
    const updateOps = {};
    for (const ops of req.body){
      updateOps[ops.propName] = ops.value;
    }
    try{
      // const category = await Post.findById(id);
      
      const category = await Category.update({_id: id}, { $set: updateOps});
    if(!category){
      return res.status(404).json({
        error: "Category not found"
      });
    }
      res.status(201).json({
        message: "Category updated successfully"
      });  
    }
    catch(err){
      console.log(err.message);
      res.status(500).json({
        error: err.stack
      });
    }
  };

  async function deleteCategory(req, res, next){
    const id = req.params.categoryId;
    try{
        const category = await Category.findById(id);
        if(!category){
          return res.status(404).json({
            error: "Category does not exist"
          });
        }
        await category.remove();
        res.status(200).json({
          message: "Product deleted successfully",
          request: {
            type: 'POST',
            description: 'Create new category', 
            url: 'http://localhost:4000/api/categories/',
            body: {name: 'String, required', description: 'String'}
          }
        });
    }
    catch(err) {
      console.log(err);
      res.status(500).json({error: err});
    };
  }



  return {
    get,
    post,
    updateCategory,
    deleteCategory
  };
}

module.exports = categoriesController;