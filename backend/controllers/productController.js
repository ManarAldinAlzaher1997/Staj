const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = { isAvailable: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const products = await Product.find(filter).populate('category');
    res.json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Ürün bulunamadı'
      });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// YENİ: Ürün oluştururken resmi MongoDB'de base64 + data URL olarak saklıyoruz
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    // Resmi base64 + data URL formatında sakla
    let image = '';
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      image = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        error: 'Kategori bulunamadı'
      });
    }
    
    const product = await Product.create({
      name,
      description,
      price,
      category,
      image
    });
    
    await product.populate('category');
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// YENİ: Ürünü güncellerken yeni resim geldiyse yine base64 + data URL olarak saklıyoruz
exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Eğer yeni resim yüklendiyse, base64 + data URL olarak sakla
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      updateData.image = `data:${req.file.mimetype};base64,${base64Image}`;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Ürün bulunamadı'
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Ürün bulunamadı'
      });
    }
    
    res.json({
      success: true,
      message: 'Ürün tamamen silindi'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
