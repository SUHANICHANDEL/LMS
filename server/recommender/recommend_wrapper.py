# server/recommender/recommend_wrapper.py

import sys
import json
from recommend import get_recommendations

if __name__ == "__main__":
    user_id = int(sys.argv[1])
    recommendations = get_recommendations(user_id)
    print(json.dumps(recommendations))
