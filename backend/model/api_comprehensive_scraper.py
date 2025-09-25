from flask import Flask, request, jsonify
import os
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scraping_googlemaps import scrape_google_maps
from scraping_linkedin import scrape_linkedin
from scraping_yellowpages import scrape_yellow_pages
from scraping_websites import scrape_website
from cleaning import clean_and_deduplicate
import threading
import time
from datetime import datetime

app = Flask(__name__)

# Set environment variables
os.environ["SERPAPI_KEY"] = "a11986b6c3012cc964a3eed47daadc9770e568943fd3c1854e8f79551a709c3c"

# Global state for scraping jobs
scraping_jobs = {}
job_counter = 0

def run_comprehensive_scrape(job_id, industry, location, sources):
    """Run scraping across multiple sources"""
    global scraping_jobs
    
    try:
        scraping_jobs[job_id]["status"] = "running"
        scraping_jobs[job_id]["progress"] = 0
        scraping_jobs[job_id]["results"] = []
        scraping_jobs[job_id]["stats"] = {"total_raw": 0, "total_cleaned": 0, "duplicates_removed": 0}
        
        all_results = []
        total_sources = len(sources)
        
        for i, source in enumerate(sources):
            scraping_jobs[job_id]["current_step"] = f"Scraping {source}..."
            scraping_jobs[job_id]["progress"] = int((i / total_sources) * 100)
            
            try:
                if source == "google_maps":
                    results = scrape_google_maps(industry, location)
                elif source == "linkedin":
                    results = scrape_linkedin(industry, location)
                elif source == "yellow_pages":
                    results = scrape_yellow_pages(industry, location)
                elif source == "website":
                    # For website scraping, we'd need URLs - skip for now
                    results = []
                else:
                    results = []
                
                all_results.extend(results)
                scraping_jobs[job_id]["logs"].append(f"✅ {source}: Found {len(results)} results")
                
            except Exception as e:
                scraping_jobs[job_id]["logs"].append(f"❌ {source}: Error - {str(e)}")
                scraping_jobs[job_id]["error_count"] += 1
        
        # Do NOT clean here. Return raw results only; cleaning is a separate step.
        scraping_jobs[job_id]["results"] = all_results
        raw_total = len(all_results)
        scraping_jobs[job_id]["stats"] = {"total_raw": raw_total, "total_cleaned": 0, "duplicates_removed": 0}
        scraping_jobs[job_id]["status"] = "completed"
        scraping_jobs[job_id]["progress"] = 100
        scraping_jobs[job_id]["current_step"] = "Scraping completed! Ready for cleaning."
        scraping_jobs[job_id]["logs"].append(f"✅ Final: {raw_total} raw leads collected. Cleaning required.")
        
    except Exception as e:
        scraping_jobs[job_id]["status"] = "error"
        scraping_jobs[job_id]["error"] = str(e)
        scraping_jobs[job_id]["logs"].append(f"❌ Fatal error: {str(e)}")

@app.route("/")
def home():
    return "Comprehensive Lead Scraper API is running!"

@app.route("/scrape/comprehensive", methods=["POST"])
def start_comprehensive_scrape():
    """Start a comprehensive scraping job"""
    global job_counter
    
    data = request.get_json()
    industry = data.get("industry", "")
    location = data.get("location", "")
    sources = data.get("sources", ["google_maps", "linkedin", "yellow_pages"])
    
    if not industry or not location:
        return jsonify({"error": "Industry and location are required"}), 400
    
    job_counter += 1
    job_id = f"job_{job_counter}_{int(time.time())}"
    
    # Initialize job state
    scraping_jobs[job_id] = {
        "id": job_id,
        "industry": industry,
        "location": location,
        "sources": sources,
        "status": "queued",
        "progress": 0,
        "current_step": "Initializing...",
        "results": [],
        "stats": {},
        "logs": [],
        "error_count": 0,
        "created_at": datetime.now().isoformat(),
        "error": None
    }
    
    # Start scraping in background thread
    thread = threading.Thread(target=run_comprehensive_scrape, args=(job_id, industry, location, sources))
    thread.daemon = True
    thread.start()
    
    return jsonify({
        "success": True,
        "job_id": job_id,
        "message": "Scraping job started",
        "status_url": f"/scrape/status/{job_id}"
    })

@app.route("/scrape/status/<job_id>", methods=["GET"])
def get_scrape_status(job_id):
    """Get status of a scraping job"""
    if job_id not in scraping_jobs:
        return jsonify({"error": "Job not found"}), 404
    
    job = scraping_jobs[job_id]
    return jsonify({
        "success": True,
        "job": job
    })

@app.route("/scrape/results/<job_id>", methods=["GET"])
def get_scrape_results(job_id):
    """Get results of a completed scraping job"""
    if job_id not in scraping_jobs:
        return jsonify({"error": "Job not found"}), 404
    
    job = scraping_jobs[job_id]
    if job["status"] != "completed":
        return jsonify({"error": "Job not completed yet"}), 400
    
    return jsonify({
        "success": True,
        "results": job["results"],
        "stats": job["stats"],
        "job_id": job_id
    })

@app.route("/scrape/sources", methods=["GET"])
def get_available_sources():
    """Get list of available scraping sources"""
    return jsonify({
        "success": True,
        "sources": [
            {"id": "google_maps", "name": "Google Maps", "description": "Local business listings"},
            {"id": "linkedin", "name": "LinkedIn", "description": "Company profiles"},
            {"id": "yellow_pages", "name": "Yellow Pages", "description": "Business directory"},
            {"id": "website", "name": "Company Websites", "description": "Direct website scraping"}
        ]
    })

@app.route("/scrape/jobs", methods=["GET"])
def list_jobs():
    """List all scraping jobs"""
    return jsonify({
        "success": True,
        "jobs": list(scraping_jobs.values())
    })

# Standalone Cleaning API
@app.route("/clean", methods=["POST"])
def clean_leads_api():
    """Clean and deduplicate a provided list of leads.

    Request body: { "leads": [ { ...lead fields... } ] }
    Response: { success, cleaned, stats }
    """
    try:
        data = request.get_json(silent=True) or {}
        leads = data.get("leads", [])

        cleaned_df, stats = clean_and_deduplicate(leads)
        cleaned = cleaned_df.to_dict(orient="records") if not cleaned_df.empty else []

        return jsonify({
            "success": True,
            "cleaned": cleaned,
            "stats": stats
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8005, debug=True)
