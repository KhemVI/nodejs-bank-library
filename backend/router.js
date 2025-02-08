import 'dotenv/config';
import express from 'express';
import { router as bookRouter } from './routers/bookRouter.js';

const router = express.Router()
router.get('/', (_req, res) => { res.json({message: `Bank Library (${process.env.NODE_ENV})`}); });
router.use('/book', bookRouter);
export default router;