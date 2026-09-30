from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pickle
import os

model_file = "heart_disease_model.bin"
with open(model_file, "rb") as f_in:
    dv, model = pickle.load(f_in)

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    if os.path.exists(os.path.join('.', path)):
        return send_from_directory('.', path)
    return send_from_directory('.', 'index.html')

@app.route("/predict", methods=['POST'])
def predict():
    try:
        data = request.get_json() or {}
        
        # Ensure numerical and string types match DictVectorizer expectations
        customer = {
            'age': float(data.get('age', 0)),
            'sex': str(data.get('sex', 'M')),
            'chestpaintype': str(data.get('chestpaintype', 'NAP')),
            'restingbp': float(data.get('restingbp', 120)),
            'cholesterol': float(data.get('cholesterol', 200)),
            'fastingbs': int(data.get('fastingbs', 0)),
            'restingecg': str(data.get('restingecg', 'Normal')),
            'maxhr': float(data.get('maxhr', 150)),
            'exerciseangina': str(data.get('exerciseangina', 'N')),
            'oldpeak': float(data.get('oldpeak', 0.0)),
            'st_slope': str(data.get('st_slope', 'Up'))
        }
        
        # Optional clinical indicators pass-through if present
        if 'ca' in data:
            customer['ca'] = float(data['ca'])
        if 'thal' in data:
            customer['thal'] = str(data['thal'])
            
        x = dv.transform([customer])
        y_pred = model.predict_proba(x)[0, 1]
        diseased = y_pred >= 0.5
        
        result = {
            'disease_probability': float(y_pred),
            'disease': bool(diseased),
            'status': 'success'
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 400

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8888))
    app.run(debug=True, host='0.0.0.0', port=port)
