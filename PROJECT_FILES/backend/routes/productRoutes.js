import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { matchProducts } from '../utils/dsaMatcher.js';
import { initialProducts } from '../data/mockProductsData.js';

const router = express.Router();

/**
 * Helper to fetch all candidates from MongoDB.
 * If MongoDB has 0 items or is not connected, falls back gracefully to initialProducts
 * so the frontend never crashes during college demos!
 */
const getCandidateCatalog = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const dbProducts = await Product.find({}).lean();
      if (dbProducts && dbProducts.length > 0) {
        return dbProducts;
      }
    }
  } catch (err) {
    console.warn('[MongoDB Fallback] Error reading from DB, using fallback mock data:', err.message);
  }
  return initialProducts;
};

/**
 * @route   GET /api/products
 * @desc    Return all products from MongoDB
 */
router.get('/', async (req, res, next) => {
  try {
    const products = await getCandidateCatalog();
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/products/search?q=
 * @desc    Search products by keyword in name, brand, or category
 */
router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q;

    // Error handling: Empty search validation
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Search query parameter "q" cannot be empty'
      });
    }

    const cleanQuery = query.trim().toLowerCase();
    const allProducts = await getCandidateCatalog();

    // Search filter across name, brand, and category
    const matched = allProducts.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return name.includes(cleanQuery) || brand.includes(cleanQuery) || cat.includes(cleanQuery);
    });

    return res.status(200).json({
      success: true,
      query: query.trim(),
      count: matched.length,
      data: matched
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/match
 * @desc    Find products matching the requested product using DSA pipeline
 *          (Tokenization -> Jaccard Similarity -> Levenshtein Distance -> Weighted Score)
 */
router.post('/match', async (req, res, next) => {
  try {
    const targetProduct = req.body;

    // Error handling: Empty product name validation
    if (!targetProduct || !targetProduct.name || !targetProduct.name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Product "name" is required in request body to perform entity matching'
      });
    }

    // Retrieve candidate catalog
    const allCandidates = await getCandidateCatalog();

    // Execute DSA Matching Engine
    // Calculates Tokenization -> Jaccard -> Levenshtein DP -> Weighted Score
    // Returns results sorted by matchingScore descending
    const matchedProducts = matchProducts(targetProduct, allCandidates, 50);

    // Error handling / Notice when no matching products meet threshold
    if (!matchedProducts || matchedProducts.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No matching products found above confidence threshold (50%)',
        count: 0,
        query: {
          name: targetProduct.name,
          brand: targetProduct.brand,
          seller: targetProduct.seller,
          price: targetProduct.price
        },
        data: []
      });
    }

    // Return matched products with name, seller, price, matching score, match status
    return res.status(200).json({
      success: true,
      count: matchedProducts.length,
      query: {
        id: targetProduct.id || targetProduct._id,
        name: targetProduct.name,
        brand: targetProduct.brand,
        seller: targetProduct.seller,
        price: targetProduct.price
      },
      data: matchedProducts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/seed
 * @desc    Direct seed endpoint to populate MongoDB from API
 */
router.post('/seed', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB is not currently connected. Please ensure MongoDB is running.'
      });
    }

    await Product.deleteMany({});
    const inserted = await Product.insertMany(initialProducts);

    return res.status(201).json({
      success: true,
      message: `Successfully seeded ${inserted.length} products into MongoDB!`,
      count: inserted.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
