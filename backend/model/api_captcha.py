from flask import Flask, jsonify
from playwright.sync_api import sync_playwright

app = Flask(__name__)

def scrape_ip():
    """Open browser with Playwright and fetch content"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)  
        page = browser.new_page()
        page.goto("https://httpbin.org/ip")
        content = page.inner_text("body")  
        browser.close()
        return content

@app.route("/get_ip", methods=["GET"])
def get_ip_api():
    try:
        result = scrape_ip()
        return jsonify({"status": "success", "data": result})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/")
def home():
    return "Playwright API is running!"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8002, debug=True)
