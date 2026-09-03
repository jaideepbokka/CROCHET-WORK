import express from 'express';
import { db } from '../services/db.js';
import { requireAdmin } from './auth.js';

const router = express.Router();

/**
 * GET /api/products/categories
 */
router.get('/categories', (req, res) => {
  const products = db.getProducts();
  const categoriesMap = {};

  products.forEach(p => {
    if (!categoriesMap[p.categorySlug]) {
      categoriesMap[p.categorySlug] = {
        name: p.category,
        slug: p.categorySlug,
        count: 0,
        image: p.image
      };
    }
    categoriesMap[p.categorySlug].count += 1;
  });

  const categories = Object.values(categoriesMap);
  return res.status(200).json({ categories });
});

/**
 * GET /api/products
 */
router.get('/', (req, res) => {
  const { category, search, minPrice, maxPrice, sort } = req.query;
  const products = db.getProducts({ category, search, minPrice, maxPrice, sort });
  return res.status(200).json({ products, total: products.length });
});

/**
 * GET /api/products/:id
 */
router.get('/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  return res.status(200).json({ product });
});

/**
 * POST /api/products (Admin Only: Add New Product)
 */
/**
 * POST /api/products (Admin Only: Add New Product)
 */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { id, name, category, price, originalPrice, description, image, images, dimensions, yarnMaterial, badge, colorOptions, inStock } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Product name, category, and price are required.' });
    }

    const primaryImage = image || (Array.isArray(images) && images[0]) || '/images/laptop_bag_lavender.jpg';
    const imagesList = Array.isArray(images) && images.length > 0 ? images : [primaryImage];

    const newProduct = await db.addProduct({
      id: id || ('prod-' + Date.now()),
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      description: description || 'Handcrafted artisan crochet design.',
      image: primaryImage,
      images: imagesList,
      dimensions: dimensions || '',
      yarnMaterial: yarnMaterial || '100% Premium Milk Cotton Yarn',
      badge: badge || 'New',
      colorOptions: Array.isArray(colorOptions) ? colorOptions : (colorOptions ? colorOptions.split(',').map(s => s.trim()) : ['Default']),
      inStock: inStock !== false
    });

    return res.status(201).json({ message: 'Product added successfully!', product: newProduct });
  } catch (err) {
    console.error('Add product error:', err);
    return res.status(500).json({ error: 'Failed to add product.' });
  }
});

/**
 * PUT /api/products/:id (Admin Only: Edit Product / Change Price)
 */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = req.body;
    
    if (updates.colorOptions && typeof updates.colorOptions === 'string') {
      updates.colorOptions = updates.colorOptions.split(',').map(s => s.trim());
    }

    const updatedProduct = await db.updateProduct(productId, updates);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    return res.status(200).json({ message: 'Product updated successfully!', product: updatedProduct });
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ error: 'Failed to update product.' });
  }
});

/**
 * DELETE /api/products/:id (Admin Only: Delete Product)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const productId = req.params.id;
    const deleted = await db.deleteProduct(productId);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.status(200).json({ message: 'Product deleted from store catalog.' });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});

export default router;
