import express from 'express';
import { getAllCourse, getCourseId } from '../controllers/courseController.js';
import client from '../configs/elasticsearch.js'; // ✅ Import Elasticsearch client

const courseRouter = express.Router();

courseRouter.get('/all', getAllCourse);
courseRouter.get('/:id', getCourseId);

// ✅ POST route to upload a new course and index it in Elasticsearch
courseRouter.post('/create', async (req, res) => {
  const { courseName, description } = req.body;

  if (!courseName || !description) {
    return res.status(400).json({ error: 'Course name and description are required' });
  }

  try {
    // Save the course in the database here (if you have a DB setup)
    // Example: const savedCourse = await Course.create({ courseName, description });

    // ✅ Index course in Elasticsearch
    await client.index({
      index: 'courses', // Index name in Elasticsearch
      body: {
        courseName,
        description,
        createdAt: new Date(),
      },
    });

    res.status(201).json({ message: 'Course created and indexed in Elasticsearch' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create and index course' });
  }
});

export default courseRouter;
