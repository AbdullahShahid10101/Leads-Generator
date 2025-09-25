#!/usr/bin/env python3
"""
Test script for the comprehensive scraper integration
"""
import requests
import json
import time

def test_comprehensive_scraper():
    base_url = "http://localhost:8005"
    
    print("🧪 Testing Comprehensive Scraper API...")
    
    # Test 1: Check if service is running
    try:
        response = requests.get(f"{base_url}/")
        print(f"✅ Service is running: {response.text}")
    except Exception as e:
        print(f"❌ Service not running: {e}")
        return
    
    # Test 2: Get available sources
    try:
        response = requests.get(f"{base_url}/scrape/sources")
        sources = response.json()
        print(f"✅ Available sources: {json.dumps(sources, indent=2)}")
    except Exception as e:
        print(f"❌ Error getting sources: {e}")
    
    # Test 3: Start a scraping job
    try:
        payload = {
            "industry": "Technology",
            "location": "New York",
            "sources": ["google_maps", "linkedin"]
        }
        response = requests.post(f"{base_url}/scrape/comprehensive", json=payload)
        job_data = response.json()
        print(f"✅ Job started: {json.dumps(job_data, indent=2)}")
        
        if job_data.get("success"):
            job_id = job_data["job_id"]
            
            # Test 4: Poll job status
            print(f"🔄 Polling job status for {job_id}...")
            for i in range(10):  # Poll for up to 20 seconds
                time.sleep(2)
                try:
                    status_response = requests.get(f"{base_url}/scrape/status/{job_id}")
                    status_data = status_response.json()
                    
                    if status_data.get("success"):
                        job = status_data["job"]
                        print(f"📊 Status: {job['status']} - {job['current_step']} ({job['progress']}%)")
                        
                        if job["status"] == "completed":
                            print("✅ Job completed!")
                            
                            # Test 5: Get results
                            results_response = requests.get(f"{base_url}/scrape/results/{job_id}")
                            results_data = results_response.json()
                            print(f"📋 Results: {json.dumps(results_data, indent=2)}")
                            break
                        elif job["status"] == "error":
                            print(f"❌ Job failed: {job.get('error', 'Unknown error')}")
                            break
                    else:
                        print(f"❌ Error getting status: {status_data}")
                        break
                        
                except Exception as e:
                    print(f"❌ Error polling status: {e}")
                    break
        else:
            print(f"❌ Failed to start job: {job_data}")
            
    except Exception as e:
        print(f"❌ Error starting job: {e}")
    
    # Test 6: List all jobs
    try:
        response = requests.get(f"{base_url}/scrape/jobs")
        jobs = response.json()
        print(f"📝 All jobs: {json.dumps(jobs, indent=2)}")
    except Exception as e:
        print(f"❌ Error listing jobs: {e}")

if __name__ == "__main__":
    test_comprehensive_scraper()
