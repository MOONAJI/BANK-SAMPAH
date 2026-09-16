const express = require('express');
const router = express.Router();
const {
  getWasteCategories,
  getWasteCategoryById,
  createWasteCategory,
  updateWasteCategory,
  deleteWasteCategory
} = require('../controllers/wasteController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getWasteCategories)
  .post(protect, authorize('admin'), createWasteCategory);

router
  .route('/:id')
  .get(getWasteCategoryById)
  .put(protect, authorize('admin'), updateWasteCategory)
  .delete(protect, authorize('admin'), deleteWasteCategory);

module.exports = router;
