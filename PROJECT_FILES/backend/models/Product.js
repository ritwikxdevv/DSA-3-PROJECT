import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true
    },
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      index: true
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    description: {
      type: String,
      default: ''
    },
    seller: {
      type: String,
      required: [true, 'Seller name is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive']
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // Optional metadata to support rich e-commerce presentation
    originalPrice: {
      type: Number
    },
    rating: {
      type: Number,
      default: 4.5
    },
    reviewsCount: {
      type: Number,
      default: 120
    },
    specs: {
      type: Map,
      of: String,
      default: {}
    },
    warranty: {
      type: String,
      default: '1 Year Brand Warranty'
    },
    deliveryDays: {
      type: Number,
      default: 2
    },
    freeDelivery: {
      type: Boolean,
      default: true
    },
    referenceId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field to map 'image' to 'imageUrl' for frontend backwards compatibility
productSchema.virtual('imageUrl').get(function () {
  return this.image;
});

// Text index on name and brand for keyword search
productSchema.index({ name: 'text', brand: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
