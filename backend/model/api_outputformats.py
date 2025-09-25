from flask import Flask, request, jsonify, send_file
import csv
import json
import pandas as pd
import os

app = Flask(__name__)


def export_data(data, filename, format_type):
    if not data:
        return None, "No data to export."

    if format_type == "csv":
        keys = data[0].keys()
        filepath = f"{filename}.csv"
        with open(filepath, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data)

    elif format_type == "excel":
        filepath = f"{filename}.xlsx"
        df = pd.DataFrame(data)
        df.to_excel(filepath, index=False)

    elif format_type == "json":
        filepath = f"{filename}.json"
        with open(filepath, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=4, ensure_ascii=False)

    else:
        return None, "Invalid choice! Please select csv, excel, or json."

    return filepath, None


@app.route("/export", methods=["POST"])
def export_api():
    req_data = request.get_json()

    data = req_data.get("data")
    filename = req_data.get("filename", "output")
    format_type = req_data.get("format_type", "csv")

    filepath, error = export_data(data, filename, format_type)

    if error:
        return jsonify({"error": error}), 400

    return send_file(filepath, as_attachment=True)


@app.route("/")
def home():
    return "Leads Export API is running!"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8004, debug=True)
