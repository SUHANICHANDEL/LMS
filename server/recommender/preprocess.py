# server/recommender/preprocess.py

import pandas as pd

def preprocess_interactions(input_path='data/user_interactions.csv', output_path='data/user_ratings.csv'):
    """
    Convert interaction_type to numeric ratings for ALS training.
    """
    df = pd.read_csv(input_path)

    rating_map = {
        'viewed': 2,
        'enrolled': 4,
        'completed': 5
    }

    df['rating'] = df['interaction_type'].map(rating_map)
    df = df[['userId', 'courseId', 'rating']]  # Drop other columns if exist
    df.to_csv(output_path, index=False)
    return output_path

if __name__ == "__main__":
    preprocess_interactions()
