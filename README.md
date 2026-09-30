# 🫀 CardioShield - Heart Disease Prediction System

CardioShield is a modern, responsive healthcare web application integrated with a Flask Machine Learning API for predicting heart disease risk based on clinical biomarkers.

🌐 **Live Server / Online Demo**: [https://rajesh-22114.github.io/heart_disease_detection/](https://rajesh-22114.github.io/heart_disease_detection/)

---

## 📂 Project Structure

```
├── index.html                 # Home Page (Hero, Stats, Tips, FAQ)
├── predict.html               # Clinical Risk Assessment Form
├── result.html                # SVG Gauge Chart & Recommendations
├── about.html                 # Architecture & Model Documentation
├── style.css                  # Modern Glassmorphism & Healthcare Theme
├── script.js                  # Dynamic API Client, PDF Export, History Drawer
├── app.py                     # Flask REST API & Web Server (/predict)
├── heart_disease_model.bin    # Trained Scikit-Learn Model & DictVectorizer
├── requirements.txt           # Production Dependencies (Flask, Scikit-Learn, Gunicorn)
├── Procfile                   # Web process command for Render / Cloud hosting
├── render.yaml                # Render Infrastructure-as-Code Configuration
├── Dockerfile                 # Container Deployment File
└── result.py                  # API Testing Script
```

---

## 🚀 Local Development & Execution

### 1️⃣ Run via Python Virtual Environment

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Flask Server
python app.py
```

The application will be live at:
👉 `http://localhost:8888`

---

## 🌐 Live Server / Online Application

You can access and test the live application interface hosted on GitHub Pages:
👉 **[https://rajesh-22114.github.io/heart_disease_detection/](https://rajesh-22114.github.io/heart_disease_detection/)**

---

## ☁️ Deployment Instructions (GitHub + Render)

### Step 1: Push Project to GitHub

Open terminal in the project directory and run:

```bash
git add .
git commit -m "Add production web app and Render deployment configs"
git branch -M main
git push -u origin main
```

---

### Step 2: Host for FREE on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository (`heart_disease_detection`).
3. Fill in the deployment details:
   - **Name**: `cardioshield-heart-risk` (or any unique name)
   - **Environment**: `Python 3`
   - **Region**: Select closest region (e.g., Singapore / Oregon / Frankfurt)
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. Select the **Free** instance plan and click **Create Web Service**.

Render will build the application and provide a live URL such as:
👉 `https://cardioshield-heart-risk.onrender.com`

> **Note**: `script.js` automatically detects whether the app is running on `localhost` or hosted on Render and routes API calls seamlessly.

---

## 🧪 Testing API Endpoint Directly

You can test the Flask prediction endpoint via curl or Python:

```bash
python result.py
```

Sample JSON Request Payload (`POST /predict`):
```json
{
  "age": 63,
  "sex": "M",
  "chestpaintype": "ASY",
  "restingbp": 160,
  "cholesterol": 290,
  "fastingbs": 1,
  "restingecg": "ST",
  "maxhr": 115,
  "exerciseangina": "Y",
  "oldpeak": 2.5,
  "st_slope": "Flat"
}
```

Sample API Response:
```json
{
  "disease": true,
  "disease_probability": 0.9864,
  "status": "success"
}
```

---

## 👨‍💻 Author Information

- **Developer**: Rajesh Kommu
- **Bio**: Passionate AI/ML student with a strong background in Deep Learning and Computer Vision. Skilled in Python, TensorFlow, PyTorch, and various Machine Learning libraries. Strong problem-solving, research, and collaboration abilities with a passion for developing cutting-edge AI solutions.
- **GitHub Profile**: [https://github.com/Rajesh-22114](https://github.com/Rajesh-22114)
- **LinkedIn Profile**: [https://www.linkedin.com/in/rajesh-kommu](https://www.linkedin.com/in/rajesh-kommu)

---

## 🔒 Medical Disclaimer

CardioShield is an educational and decision-support tool powered by Machine Learning. It does not replace professional clinical evaluation or diagnosis by a licensed cardiologist.
