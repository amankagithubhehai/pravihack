import express from 'express';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  bulkImportAssets,
} from '../controllers/assetController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAssets);
router.get('/:id', protect, getAssetById);
router.post('/', protect, authorize('Super Admin', 'Organization Admin', 'Asset Manager'), createAsset);
router.put('/:id', protect, authorize('Super Admin', 'Organization Admin', 'Asset Manager'), updateAsset);
router.delete('/:id', protect, authorize('Super Admin', 'Organization Admin'), deleteAsset);
router.post('/bulk-import', protect, authorize('Super Admin', 'Organization Admin', 'Asset Manager'), bulkImportAssets);

export default router;
