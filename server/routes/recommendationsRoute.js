import express from 'express';
import { getRecommendations } from '../controllers/recommendationsController.js';

const router = express.Router();

// Modified route to handle rating filter as query parameter
router.get('/:userId', async (req, res) => {
  try {
    // Extract userId from the route parameters
    const userId = req.params.userId;

    // Extract rating filter from query parameters (default to 5 if not provided)
    const ratingFilter = parseInt(req.query.rating) || 5;

    // Fetch the recommended courses based on the userId
    const recommendedCourses = await getRecommendations(userId);

    // Filter courses by rating
    const filteredCourses = recommendedCourses.filter(course => course.rating >= ratingFilter);

    // Return the filtered courses
    res.json({ recommendedCourses: filteredCourses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

export default router;
