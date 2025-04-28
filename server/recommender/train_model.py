# server/recommender/train_model.py

from pyspark.sql import SparkSession
from pyspark.ml.recommendation import ALS
from server.recommender.preprocess import preprocess_interactions

def train_recommender_model():
    spark = SparkSession.builder \
        .appName("LMSRecommenderTraining") \
        .master("local[*]") \
        .getOrCreate()

    # Preprocess and load data
    ratings_csv = preprocess_interactions()
    data = spark.read.csv(ratings_csv, header=True, inferSchema=True)

    # Build ALS model
    als = ALS(
        userCol="userId",
        itemCol="courseId",
        ratingCol="rating",
        rank=10,
        maxIter=15,
        regParam=0.09,
        coldStartStrategy="drop",
        nonnegative=True
    )

    model = als.fit(data)

    # Save the model
    model.save("models/als_model")
    print("Model training complete and saved at models/als_model")

if __name__ == "__main__":
    train_recommender_model()
