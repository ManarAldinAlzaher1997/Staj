const Category = require('../models/Category');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isActive: true 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Bu isimde bir kategori zaten var'
      });
    }
    
    const deletedCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isActive: false
    });
    
    if (deletedCategory) {
      deletedCategory.isActive = true;
      deletedCategory.description = description || deletedCategory.description;
      await deletedCategory.save();
      
      return res.status(200).json({
        success: true,
        category: deletedCategory
      });
    }
    
    const category = await Category.create({
      name,
      description: description || ''
    });
    
    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Kategori bulunamadı'
      });
    }
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 

exports.deleteCategory = async (req, res) => {
  try {l
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Kategori bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Kategori tamamen silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};