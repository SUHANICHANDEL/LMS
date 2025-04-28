import sys
import pandas as pd
from pyspark.sql import SparkSession
from pyspark.ml.recommendation import ALS
from pyspark.ml.evaluation import RegressionEvaluator

# Initialize Spark session
spark = SparkSession.builder.appName('LMSRecommendationSystem').getOrCreate()

# Sample data (you should replace this with your MongoDB data fetch later)
data = [
    (1, 101, 5.0),  # (userId, courseId, rating)
    (1, 102, 3.0),
    (2, 101, 4.0),
    (2, 103, 5.0),
    (3, 102, 2.0),
    (3, 103, 4.0),
]

columns = ["userId", "courseId", "rating"]

# Create dataframe
df = spark.createDataFrame(data, columns)

# Train ALS model
als = ALS(
    userCol="userId",
    itemCol="courseId",
    ratingCol="rating",
    coldStartStrategy="drop",
    nonnegative=True,
    implicitPrefs=False,
    rank=10,
    maxIter=10,
    regParam=0.1
)

model = als.fit(df)

# Get the user ID passed from Node.js
user_id = int(sys.argv[1])

# Create a dataframe for the specific user
user_df = spark.createDataFrame([(user_id,)], ["userId"])

# Make recommendations for the user
user_recommendations = model.recommendForUserSubset(user_df, 5)

# Extract recommended course IDs
courses = user_recommendations.collect()

# Output the courseIds
if courses:
    recommended_courseIds = [row.courseId for row in courses[0].recommendations]
    print(recommended_courseIds)
else:
    print([])

spark.stop()
