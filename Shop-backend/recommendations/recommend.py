# recommend.py

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import sys
import json

# CSV data read
df = pd.read_csv("products.csv", sep="\t")

# Text vectorization on descriptions
tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(df['description'])

# Similarity calculation
cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

# Recommendation function
def get_recommendations(product_name, top_n=5):
    indices = pd.Series(df.index, index=df['name']).drop_duplicates()
    
    if product_name not in indices:
        return []
    
    idx = indices[product_name]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:top_n+1]
    product_indices = [i[0] for i in sim_scores]
    return df[['name', 'category', 'description']].iloc[product_indices].to_dict(orient='records')

# If running as script
if __name__ == "__main__":
    input_product = sys.argv[1]
    result = get_recommendations(input_product)
    print(json.dumps(result))
