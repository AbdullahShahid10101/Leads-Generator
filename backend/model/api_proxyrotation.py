from flask import Flask, request, jsonify
import requests
import random

app = Flask(__name__)

# Proxy list
proxies_list = [
    "http://123.45.67.89:8080",
    "http://98.76.54.32:3128",
    "http://111.222.333.444:8000"
]

url = "https://httpbin.org/ip"  #demo website

# Function to test proxies
def test_proxies(n=5):
    results = []
    for i in range(n):
        proxy = random.choice(proxies_list)
        try:
            response = requests.get(url, proxies={"http": proxy, "https": proxy}, timeout=5)
            results.append({
                "proxy": proxy,
                "ip": response.json().get("origin"),
                "status": "success"
            })
        except Exception as e:
            results.append({
                "proxy": proxy,
                "error": str(e),
                "status": "failed"
            })
    return results

# API route
@app.route("/proxies", methods=["GET"])
def proxies_api():
    n = request.args.get("n", default=5, type=int)  # number of attempts (default=5)
    results = test_proxies(n)
    return jsonify(results)

@app.route("/")
def home():
    return " Proxy Rotation API is running!"

@app.route("/predict", methods=["POST"])
def predict_api():
    try:
        payload = request.get_json(force=True)
        # TODO: integrate real model logic here using payload
        return jsonify({"success": True, "data": {"received": payload}})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8001, debug=True)
