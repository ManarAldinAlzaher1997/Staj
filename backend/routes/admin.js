const express = require('express');
const router = express.Router();

const {getAllCategories, createCategory, updateCategory, deleteCategory} = require('../controllers/categoryController');
const { getAllProducts, createProduct, updateProduct,deleteProduct} = require('../controllers/productController');
const { getAllOrders, updateOrderStatus} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

console.log('updateProduct fonksiyonu:', updateProduct);
console.log('typeof updateProduct:', typeof updateProduct);
console.log('updateCategory fonksiyonu:', updateCategory);
console.log('updateOrderStatus fonksiyonu:', updateOrderStatus);


router.get('/kategoriler', protect, admin, getAllCategories);
router.post('/kategoriler', protect, admin, createCategory);
router.put('/kategoriler/:id', protect, admin, updateCategory);
router.delete('/kategoriler/:id', protect, admin, deleteCategory);


router.get('/urunler', protect, admin, getAllProducts);
router.post('/urunler', protect, admin, upload.single('image'), createProduct);
router.put('/urunler/:id', protect, admin, upload.single('image'), updateProduct);
router.delete('/urunler/:id', protect, admin, deleteProduct);


router.get('/siparisler', protect, admin, getAllOrders);
router.put('/siparisler/:id/durum', protect, admin, updateOrderStatus);

module.exports = router;