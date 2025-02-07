import express from 'express';
import cors from 'cors';
import router from './router.js';
import 'dotenv/config';

const app = express();
const port = process.env.APP_PORT || 9400;
const allowedOrigins = ['http://localhost:3000']; // Suppose we have a frontend app that is connected to our APIs.

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use('/api', router);

app.listen(port, () => {
    console.log(`Example app listening at ${port}`)
})
