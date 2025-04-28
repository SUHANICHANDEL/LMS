import  { useState, useEffect } from 'react';
import axios from 'axios';
import ReactStars from 'react-rating-stars-component';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(5); // Default to show all 5-star courses

  // Fetch recommended courses from the server based on the rating filter
  useEffect(() => {
    // Sending the selected rating filter to the server
    axios.get(`http://localhost:5000/api/recommendations?rating=${ratingFilter}`)
      .then(response => {
        // Update the state with the filtered recommendations
        setRecommendations(response.data.recommendedCourses);
      })
      .catch(error => {
        console.error("Error fetching recommendations:", error);
      });
  }, [ratingFilter]); // Re-fetch data whenever ratingFilter changes

  // Handle rating change
  const handleRatingChange = (newRating) => {
    setRatingFilter(newRating);
  };

  return (
    <div>
      <h2>Course Recommendations</h2>

      {/* Star rating filter */}
      <ReactStars
        count={5} // Show 5 stars
        onChange={handleRatingChange} // Set the rating value when the user selects it
        size={24} // Size of the stars
        activeColor="#ffd700" // Color of selected stars
      />

      {/* Display recommended courses */}
      <div>
        {recommendations.length > 0 ? (
          recommendations.map(course => (
            <div key={course.id}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>Rating: {course.rating} stars</p>
            </div>
          ))
        ) : (
          <p>No courses to display</p>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
