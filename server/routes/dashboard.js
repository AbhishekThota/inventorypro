const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const [totalProducts, totalCategories, lowStockProducts, outOfStockProducts] = await Promise.all([
      Product.countDocuments({ status: 'active' }),
      Category.countDocuments(),
      Product.countDocuments({
        $expr: { $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$lowStockThreshold'] }] },
        status: 'active',
      }),
      Product.countDocuments({ quantity: 0, status: 'active' }),
    ]);

    // Total inventory value
    const valueAgg = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$price', '$quantity'] } } } },
    ]);
    const totalValue = valueAgg[0]?.totalValue || 0;

    // Products by category
    const byCategory = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', color: '$category.color', count: 1, totalQuantity: 1 } },
      { $sort: { count: -1 } },
    ]);

    // Recent low stock items
    const lowStockItems = await Product.find({
      $expr: { $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$lowStockThreshold'] }] },
      status: 'active',
    })
      .populate('category', 'name color')
      .sort({ quantity: 1 })
      .limit(5);

    res.json({
      totalProducts,
      totalCategories,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      byCategory,
      lowStockItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
