import re
import pandas as pd

def normalize_email(email):
    if not email: return None
    return email.strip().lower()

def normalize_phone(phone):
    if not phone: return None
    digits = re.sub(r'\D', '', phone)
    if digits.startswith("00"):
        digits = digits[2:]
    if not digits.startswith("+"):
        digits = "+" + digits
    return digits

def normalize_website(website):
    if not website: return None
    site = re.sub(r"https?://", "", website)
    site = site.strip().lower().rstrip("/")
    return site

def clean_and_deduplicate(raw_results):
    if not raw_results:
        return pd.DataFrame(), {"total_raw": 0, "total_cleaned": 0, "duplicates_removed": 0}
    
    df = pd.DataFrame(raw_results)
    total_raw = len(df)
    
    # Normalize fields
    if "email" in df.columns:
        df["email"] = df["email"].apply(normalize_email)
    if "phone" in df.columns:
        df["phone"] = df["phone"].apply(normalize_phone)
    if "website" in df.columns:
        df["website"] = df["website"].apply(normalize_website)
    if "name" in df.columns:
        df["name"] = df["name"].fillna("").str.strip().str.title()
    
    # Remove duplicates based on key fields
    subset_cols = [c for c in ["email","website","name"] if c in df.columns]
    if subset_cols:
        df = df.drop_duplicates(subset=subset_cols, keep="first")
    
    total_cleaned = len(df)
    duplicates_removed = total_raw - total_cleaned
    
    return df, {"total_raw": total_raw, "total_cleaned": total_cleaned, "duplicates_removed": duplicates_removed}
