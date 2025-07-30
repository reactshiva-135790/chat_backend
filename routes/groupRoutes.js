import express from 'express';
import { createGroup, addUserToGroup } from '../controllers/groupController.js';

const router = express.Router();

router.post('/create', createGroup);
router.post('/:groupId/add-user', addUserToGroup); 

export default router;
