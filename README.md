# ShopZone – eCommerce Website

This project includes:
- Node.js backend (Shop-backend)
- HTML/CSS/JS frontend (ShopZone)
- AI Recommendation System (Python-based)

## 📦 Project Structure

ShopZone/
│
├── Shop-backend/ # Node.js server & APIs
├── ShopZone/ # Frontend HTML/CSS/JS
├── AI_Model/ # AI Recommendation Scripts
├── .gitignore
└── README.md

## 🚀 How to Run AI Recommendation System

1. Go to AI_Model folder:

cd AI_Model

cpp
Copy
Edit

2. Create virtual environment:

python -m venv .venv

markdown
Copy
Edit

3. Activate the environment:

- On Windows:
.venv\Scripts\activate

diff
Copy
Edit

- On Linux/Mac:
source .venv/bin/activate

markdown
Copy
Edit

4. Install required packages:

pip install -r requirements.txt

markdown
Copy
Edit

5. Run the model:

python recommendation.py

yaml
Copy
Edit

---

### 🔐 Note:
- `node_modules/`, `.venv/`, and `.env` are excluded via `.gitignore` for clean uploads.
- You can host the frontend on Netlify and backend on Render.

