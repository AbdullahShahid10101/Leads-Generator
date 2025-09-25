import requests
from bs4 import BeautifulSoup
import re

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
                "email": None
            })
        return results
    else:
        # fallback: OpenStreetMap Nominatim
        url = f"https://nominatim.openstreetmap.org/search"
        params = {"q": f"{industry}, {location}", "format": "json", "limit": 5}
        r = requests.get(url, params=params, headers={"User-Agent":"Mozilla/5.0"})
        data = r.json()
        return [{"name": d.get("display_name"), "location": location, "phone": None, "website": None, "email": None} for d in data]

def scrape_linkedin(industry: str, location: str, max_results: int = 5):
    query = f"site:linkedin.com/company {industry} {location}"
    url = "https://lite.duckduckgo.com/50x.html"  # Lite version works better
    resp = requests.post(url, data={"q": query}, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(resp.text, "html.parser")

    results = []
    for res in soup.select("a.result-link")[:max_results]:
        results.append({
            "name": res.get_text(strip=True),
            "url": res.get("href"),
            "location": location,
            "industry": industry
        })

    return results

def scrape_yellow_pages(industry: str, location: str, max_results: int = 10):
    query = f"{industry} {location}"
    url = f"https://api.opencorporates.com/v0.4/companies/search?q={query}"
    resp = requests.get(url, timeout=15)

    if resp.status_code != 200:
        print("⚠️ API request failed:", resp.status_code)
        return []

    data = resp.json()
    companies = data.get("results", {}).get("companies", [])

    results = []
    for c in companies[:max_results]:
        company = c["company"]
        results.append({
            "name": company.get("name"),
            "location": company.get("jurisdiction_code"),
            "industry": industry,
            "website": company.get("website"),
            "email": None
        })

    return results

def scrape_website(url: str):
    try:
        headers = {"User-Agent": "Mozilla/5.0 (LeadHarvestAI/1.0)"}
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code != 200:
            print(f"⚠️ Failed to fetch {url}: {resp.status_code}")
            return []

        soup = BeautifulSoup(resp.text, "html.parser")

        title = soup.title.string.strip() if soup.title else url

        meta = soup.find("meta", attrs={"name": "description"}) \
            or soup.find("meta", attrs={"property": "og:description"})
        description = meta["content"].strip() if meta and "content" in meta.attrs else soup.get_text()[:150]

        text = soup.get_text()
        emails = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
        email = emails[0] if emails else None

        phones = re.findall(r"\+?\d[\d\-\(\) ]{7,}\d", text)
        phone = phones[0] if phones else None

        return [{
            "name": title,
            "website": url,
            "email": email,
            "phone": phone,
            "description": description
        }]
    except Exception as e:
        print(f"❌ Error scraping {url}: {e}")
        return []
