import os
from serpapi import Client
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from dotenv import load_dotenv


class ReviewEngine:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("SERP_API_KEY")

        if not self.api_key:
            raise ValueError("SERPAPI_KEY not found in environment variables")

        self.sentiment_analyzer = SentimentIntensityAnalyzer()

    # Step 1: Get data_id from place name
    def get_place_data_id(self, place_name: str) -> str:
        params = {
            "engine": "google_maps",
            "q": place_name,
            "type": "search"
        }

        client = Client(api_key=self.api_key)
        results = client.search(params)

        local_results = results.get("local_results")

        if not local_results:
            raise Exception("Place not found")

        # Choose result with highest review count
        best_match = max(
            local_results,
            key=lambda x: x.get("reviews", 0)
        )

        data_id = best_match.get("data_id")

        if not data_id:
            raise Exception("data_id not found")

        return data_id

    # Step 2: Fetch reviews using data_id
    def get_reviews(self, data_id: str) -> list:
        params = {
            "engine": "google_maps_reviews",
            "data_id": data_id,
            "hl": "en"
        }

        client = Client(api_key=self.api_key)
        results = client.search(params)

        reviews = results.get("reviews")

        if not reviews:
            raise Exception("No reviews found")

        return reviews

    # Step 3: Compute review score
    def compute_review_score(self, review: dict) -> float:
        text = review.get("snippet", "")
        rating = review.get("rating", 0)

        if not text or len(text.strip()) < 20:
            return None

        sentiment_score = self.sentiment_analyzer.polarity_scores(text)["compound"]
        normalized_rating = rating / 5  # scale 0–1

        final_score = (0.7 * normalized_rating) + (0.3 * sentiment_score)

        return final_score

    # Step 4: Rank reviews
    def rank_reviews(self, reviews: list) -> dict:
        scored_reviews = []

        for review in reviews:
            score = self.compute_review_score(review)
            if score is not None:
                review["final_score"] = score
                scored_reviews.append(review)

        if not scored_reviews:
            raise Exception("No valid reviews to rank")

        best_review = max(scored_reviews, key=lambda x: x["final_score"])
        worst_review = min(scored_reviews, key=lambda x: x["final_score"])

        return {
            "best_review": {
                "rating": best_review.get("rating"),
                "text": best_review.get("snippet"),
                "score": best_review.get("final_score")
            },
            "worst_review": {
                "rating": worst_review.get("rating"),
                "text": worst_review.get("snippet"),
                "score": worst_review.get("final_score")
            }
        }

    # Public Method: Get Best & Worst Review
    def get_best_and_worst_review(self, place_name: str) -> dict:
        data_id = self.get_place_data_id(place_name)
        reviews = self.get_reviews(data_id)
        ranked_reviews = self.rank_reviews(reviews)

        return {
            "place_name": place_name,
            "best_review": ranked_reviews["best_review"],
            "worst_review": ranked_reviews["worst_review"]
        }
