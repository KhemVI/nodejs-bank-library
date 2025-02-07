import 'dotenv/config';
import express from 'express';
import { router as itemRouter } from './routers/item.js';

const router = express.Router()
router.get('/', (_req, res) => { res.json({message: `Bank Library (${process.env.NODE_ENV})`}); });
router.use('/item', itemRouter);
export default router;