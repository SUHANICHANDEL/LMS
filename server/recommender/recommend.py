# server/recommender/recommend.py

from pyspark.sql import SparkSession
from pyspark.ml.recommendation import ALSModel

def get_recommendations(user_id, num_recommendations=5):
    spark = SparkSession.builder \
        .appName("LMSRecommender") \
        .master("local[*]") \
        .getOrCreate()

    # Load the model
    model = ALSModel.load("models/als_model")

    # Create dataframe for single user
    users = spark.createDataFrame([(user_id,)], ["userId"])

    # Generate recommendations
    recommendations = model.recommendForUserSubset(users, num_recommendations)

    # Transform output
    recs = recommendations.collect()
    if not recs:
        return {"message": "No recommendations found for this user."}

    courses = recs[0]['recommendations']
    recommended_courses = [{"courseId": row.courseId, "rating": row.rating} for row in courses]

    return recommended_courses
