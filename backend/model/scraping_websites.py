import requests
from bs4 import BeautifulSoup
import re

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
            "description": description,
            "source": "website"
        }]
    except Exception as e:
        print(f"❌ Error scraping {url}: {e}")
        return []
