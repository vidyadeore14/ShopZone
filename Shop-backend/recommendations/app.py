from flask import Flask, request, jsonify
from recommend import get_recommendations

app = Flask(__name__)

@app.route('/recommend', methods=['GET'])
def recommend():
    product_name = request.args.get('product')
    if not product_name:
        return jsonify({'error': 'Product name is required'}), 400
    
    recommendations = get_recommendations(product_name)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)


