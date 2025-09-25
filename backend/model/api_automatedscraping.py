from flask import Flask, jsonify
import time
import schedule
from datetime import datetime
import threading

app = Flask(__name__)


last_run_status = {"time": None, "status": "Not run yet"}

def scrape():
    global last_run_status
    try:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Running scraping task...")
        # scraping code here
        print("Scraping done ")
        last_run_status = {"time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "status": "success"}
    except Exception as e:
        last_run_status = {"time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "status": f"error: {e}"}
        print(f"Error during scraping: {e}")

schedule.every(10).minutes.do(scrape)

def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(1)

threading.Thread(target=run_scheduler, daemon=True).start()



@app.route("/")
def home():
    return "Scraper API is running!"


@app.route("/scrape", methods=["GET"])
def run_scraper():
    scrape()
    return jsonify({"message": "Scraper executed manually", "status": last_run_status})


@app.route("/status", methods=["GET"])
def get_status():
    return jsonify(last_run_status)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8003, debug=True)
