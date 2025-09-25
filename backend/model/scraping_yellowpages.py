import requests

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
            "email": None,
            "source": "yellow_pages",
            "phone": None
        })

    return results
