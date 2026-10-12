/**
 * Frontend API Service for ProductMatch Platform
 * Communicates with the Node.js / Express Backend REST APIs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Check backend API health and MongoDB status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`Health check failed with HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('[API Warning] Backend health check unreachable:', error.message);
    return { status: 'offline', error: error.message };
  }
}

/**
 * Fetch all products from MongoDB
 * GET /api/products
 */
export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP Error ${res.status}`);
    }
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('[API Error] fetchProducts failed:', error.message);
    throw error;
  }
}

/**
 * Search products by keyword
 * GET /api/products/search?q=
 */
export async function searchProducts(query) {
  if (!query || !query.trim()) {
    throw new Error('Search query cannot be empty');
  }

  try {
    const res = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query.trim())}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP Error ${res.status}`);
    }
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('[API Error] searchProducts failed:', error.message);
    throw error;
  }
}

/**
 * Find matching products via Backend DSA Engine
 * POST /api/match
 */
export async function findMatchesAPI(product) {
  if (!product || !product.name || !product.name.trim()) {
    throw new Error('Valid product with a name is required for matching');
  }

  try {
    const res = await fetch(`${API_BASE_URL}/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: product.id || product._id,
        _id: product._id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        description: product.description,
        seller: product.seller,
        price: product.price,
        image: product.image || product.imageUrl,
        specs: product.specs
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP Error ${res.status}`);
    }

    const json = await res.json();
    return {
      success: true,
      matches: json.data || [],
      count: json.count || 0,
      source: 'backend-api'
    };
  } catch (error) {
    console.error('[API Error] findMatchesAPI call failed:', error.message);
    throw error;
  }
}
