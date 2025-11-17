# 🫀 Heart Disease Prediction API (ML Zoomcamp Midterm)

This project provides a Dockerized API for predicting heart disease based on patient health attributes.  
The model was trained using the UCI Heart Disease dataset and deployed using Flask + Gunicorn inside a Docker container.

---

## 📂 Project Structure
├── app.py                       # Flask API
├── result.py                    # Client script to test API
├── midterm.ipynb                # Model training + preprocessing
├── heart.csv                    # Training dataset (optional)
├── heart_disease_model.bin      # Saved model + DictVectorizer
├── Dockerfile                   # Docker configuration
├── .dockerignore                # Files ignored in Docker build
└── requirements.txt             # Python dependencie

## 🐳 Run the Project Using Docker

### **1️⃣ Build the Docker image**
Open a terminal in the project folder and run:

```bash
docker build -t heart-midterm .
```




2️⃣ Run the Docker container
```bash
docker run --rm -p 8888:8888 heart-midterm
```





The API will now be running at:

       👉 http://127.0.0.1:8888/predict

🧪 Testing the API (Modify Inputs Inside result.py)

       Use the provided result.py script to send test inputs to the API.

Run it in a separate terminal:
```bash
        python result.py
```



✔ You can freely edit the input values in result.py

         Inside result.py, you will see something like:

                sample_input = {
                    "age": 54,
                    "sex": 1,
                    "cp": 0,
                    "trestbps": 130,
                    "chol": 246,
                    "fbs": 0,
                    "restecg": 1,
                    "thalach": 150,
                    "exang": 0,
                    "oldpeak": 1.5,
                    "slope": 2,
                    "ca": 0,
                    "thal": 2
                }


👉 You can change these values anytime to test different patient conditions.



Example output:

{
  "prediction": True docker run --rm -p 8888:8888 heart-midterm
,
  "heart_disease_probability": 0.82

}


