import esClient from './client.js';

const COURSE_INDEX = 'courses';

export async function indexCourse(course) {
  await esClient.index({
    index: COURSE_INDEX,
    id: course._id.toString(),
    body: {
      title: course.title,
      description: course.description,
      instructorId: course.instructor,
      level: course.difficulty,
      rating: course.avgRating,
      createdAt: course.createdAt
    },
    refresh: 'wait_for' // Ensure immediate searchability
  });
}

export async function deleteCourse(courseId) {
  await esClient.delete({
    index: COURSE_INDEX,
    id: courseId
  });
}