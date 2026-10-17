import express from 'express';
import { adminController } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', adminController.getAllUsers);
router.post('/create-examiner', adminController.createExaminer);
router.patch('/update-role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.post('/claim-super-admin', adminController.claimSuperAdmin);

export default router;
