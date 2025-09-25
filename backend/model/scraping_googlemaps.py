import requests

def scrape_google_maps(industry: str, location: str):
    # Use SerpAPI if key available
    import os
    SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "a11986b6c3012cc964a3eed47daadc9770e568943fd3c1854e8f79551a709c3c")
    if SERPAPI_KEY:
        url = "https://serpapi.com/search.json"
        params = {"engine":"google_maps","q":f"{industry} in {location}","api_key":SERPAPI_KEY}
        r = requests.get(url, params=params)
        data = r.json().get("local_results", [])
        results = []
        for d in data:
            results.append({
                "name": d.get("title"),
                "address": d.get("address"),
                "phone": d.get("phone"),
                "website": d.get("website"),
                "rating": d.get("rating"),
                "reviews": d.get("reviews"),
                "gps": d.get("gps_coordinates"),
                "email": None,
                "source": "google_maps",
                "industry": industry,
                "location": location
            })
        return results
    else:
        # fallback: OpenStreetMap Nominatim
        url = f"https://nominatim.openstreetmap.org/search"
        params = {"q": f"{industry}, {location}", "format": "json", "limit": 5}
        r = requests.get(url, params=params, headers={"User-Agent":"Mozilla/5.0"})
        data = r.json()
        return [{"name": d.get("display_name"), "location": location, "phone": None, "website": None, "email": None, "source": "google_maps", "industry": industry} for d in data]
