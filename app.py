from flask import Flask
from flask import request
from flask import jsonify
import pickle
model_file = "heart_disease_model.bin"
with open(model_file,"rb") as f_in:
    dv,model = pickle.load(f_in)

app = Flask("predict")
@app.route("/predict",methods = ['POST'])
def predict():
    customer = request.get_json()
    x = dv.transform([customer])
    y_pred = model.predict_proba(x)[0,1]
    diseased = y_pred >= 0.5
    result = {
        'disease_probability':float(y_pred),
        'disease': bool(diseased)
    }
    return jsonify(result)
if __name__ == "__main__":
    app.run(debug = True,host = '0.0.0.0',port = '8888')

