import requests
url = 'http://localhost:8888/predict'  
customer = {
"age": 49,
 "sex": "F",
 "chestpaintype": "NAP",
 "restingbp": 160,
 "cholesterol": 180,
 "fastingbs": 0,
 "restingecg": "Normal",
 "maxhr": 156,
 "exerciseangina": "N",
 "oldpeak": 1.0,
 "st_slope": "Flat"}
print(requests.post(url,json = customer).json())
