import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';
import searchRouter from './routes/searchRoutes.js';
import recommendationsRoute from './routes/recommendationsRoute.js'; // <-- correctly imported

const app = express();

// Connect to database
await connectDB();
await connectCloudinary();

// Global Middlewares
app.use(cors());
app.use(clerkMiddleware());

// Initialize express routes
app.get('/', (req, res) => res.send("API Working"));

// Webhook routes (Special ones that require specific body parsers)
app.post('/clerk', express.json(), clerkWebhooks);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// API Routes
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);
app.use('/api/search', express.json(), searchRouter);

// ⚡ Special case: no express.json() here for recommendations!
app.use('/api/recommendations', recommendationsRoute);

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
