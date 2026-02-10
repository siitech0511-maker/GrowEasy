# Google Maps API Setup Guide

## 🎯 Quick Start - Free Tier Setup

Follow these steps to enable Google Maps lead discovery with **10,000 free requests/month**.

---

## Step 1: Get Google Maps API Key

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `GrowEasy-LeadAggregator`
4. Click **"Create"**

### 1.2 Enable Places API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Places API"**
3. Click on **"Places API (New)"** 
4. Click **"Enable"**

### 1.3 Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy the API key (you'll need this later)
4. Click **"Restrict Key"** (recommended for security)

### 1.4 Restrict API Key (Recommended)

**API Restrictions:**
- Select **"Restrict key"**
- Choose **"Places API"** from the dropdown
- Click **"Save"**

**Application Restrictions (Optional):**
- For development: Select **"None"**
- For production: Select **"IP addresses"** and add your server IP

---

## Step 2: Configure in GrowEasy

### 2.1 Update Database Configuration

Run this SQL query to add your API key:

```sql
UPDATE marketing_source_configs 
SET 
    api_key = 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
    is_active = TRUE,
    daily_quota = 10000  -- Free tier limit
WHERE source_name = 'Google Maps';
```

**Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key.**

### 2.2 Verify Configuration

Check if the configuration is saved:

```sql
SELECT source_name, is_active, daily_quota, requests_today 
FROM marketing_source_configs 
WHERE source_name = 'Google Maps';
```

Expected output:
```
source_name  | is_active | daily_quota | requests_today
Google Maps  | 1         | 10000       | 0
```

---

## Step 3: Test Lead Discovery

### 3.1 Via Frontend

1. Navigate to `http://localhost:3000/marketing/discover`
2. Fill in the form:
   - **City**: Mumbai
   - **Category**: Restaurant (optional)
   - **Sources**: Check "Google Maps"
   - **Max Results**: 10 (for testing)
3. Click **"Start Discovery"**
4. Wait for results

### 3.2 Via API (Postman/cURL)

```bash
curl -X POST http://localhost:8000/api/v1/marketing/discover \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Mumbai",
    "category": "Restaurant",
    "sources": ["Google Maps"],
    "radius": 5000,
    "max_results": 10
  }'
```

Expected response:
```json
{
  "job_id": null,
  "status": "completed",
  "total_found": 20,
  "total_qualified": 10,
  "total_created": 10,
  "message": "Google Maps: Successfully discovered 10 new leads"
}
```

---

## 📊 Understanding the Free Tier

### What You Get Free (Monthly)

- **10,000 Place Details (Essentials)** requests
- **10,000 Autocomplete (Essentials)** requests
- **10,000 Geocoding** requests
- **Unlimited Text Search (IDs Only)**

### What We Use

Our implementation uses:
1. **Text Search** (1 request per search query)
2. **Place Details (Essentials)** (1 request per lead)

**Example:**
- Search for "Restaurants in Mumbai" = 1 Text Search request
- Fetch details for 100 qualified leads = 100 Place Details requests
- **Total**: 101 requests to discover 100 leads

### Cost After Free Tier

If you exceed 10,000 requests/month:
- **Place Details (Essentials)**: $5.00 per 1,000 requests
- **Text Search**: $32.00 per 1,000 requests

---

## 🎛️ Quota Management

### Check Daily Usage

```sql
SELECT source_name, requests_today, daily_quota, last_request_at
FROM marketing_source_configs
WHERE source_name = 'Google Maps';
```

### Reset Daily Counter (if needed)

The system automatically resets `requests_today` at midnight UTC. To manually reset:

```sql
UPDATE marketing_source_configs 
SET requests_today = 0, last_request_at = NULL
WHERE source_name = 'Google Maps';
```

### Adjust Daily Quota

To limit daily usage (e.g., 500 requests/day):

```sql
UPDATE marketing_source_configs 
SET daily_quota = 500
WHERE source_name = 'Google Maps';
```

---

## 🔧 Optimization Tips

### 1. Use Specific Categories

Instead of:
```json
{"city": "Mumbai", "category": null}
```

Use:
```json
{"city": "Mumbai", "category": "Restaurant"}
```

This reduces API calls by targeting specific businesses.

### 2. Limit Max Results

For testing, use small numbers:
```json
{"max_results": 10}
```

For production, use:
```json
{"max_results": 100}
```

### 3. Run Discovery Weekly

Instead of daily discovery, run it weekly to stay within free tier:
- 10,000 requests/month ÷ 4 weeks = 2,500 requests/week
- 2,500 requests = ~2,400 leads/week

### 4. Target High-Value Categories

Focus on categories with better conversion:
- Manufacturers (weight: +25)
- IT Services (weight: +25)
- Restaurants (weight: +20)
- Salons (weight: +15)

---

## 🚨 Troubleshooting

### Error: "Google Maps API key not configured"

**Solution:**
```sql
UPDATE marketing_source_configs 
SET api_key = 'YOUR_API_KEY', is_active = TRUE
WHERE source_name = 'Google Maps';
```

### Error: "Daily quota exceeded"

**Solution 1:** Wait until midnight UTC for auto-reset

**Solution 2:** Increase daily quota:
```sql
UPDATE marketing_source_configs 
SET daily_quota = 10000
WHERE source_name = 'Google Maps';
```

### Error: "API error: REQUEST_DENIED"

**Causes:**
- API key not enabled for Places API
- API key restrictions blocking requests

**Solution:**
1. Go to Google Cloud Console
2. Check if Places API is enabled
3. Verify API key restrictions

### No Leads Created

**Check qualification rules:**
```sql
SELECT * FROM marketing_qualification_rules WHERE is_active = TRUE;
```

Default rule requires:
- Rating ≥ 4.0
- Reviews ≥ 50
- No website required

**Adjust if needed:**
```sql
UPDATE marketing_qualification_rules 
SET min_rating = 3.5, min_reviews = 20
WHERE rule_name = 'Default High-Quality Lead';
```

---

## 📈 Monitoring Usage

### View API Usage in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Dashboard**
3. Click on **"Places API"**
4. View usage graphs and quotas

### View Usage in GrowEasy

Check the Settings page:
- Frontend: `http://localhost:3000/marketing/settings`
- Click **"Lead Sources"** tab
- View "Used Today" counter for Google Maps

---

## 🎉 Success Checklist

- [ ] Google Cloud project created
- [ ] Places API enabled
- [ ] API key created and copied
- [ ] API key added to database
- [ ] Test discovery completed successfully
- [ ] Leads visible in `http://localhost:3000/marketing/leads`
- [ ] Daily quota monitoring set up

---

## 💡 Next Steps

Once Google Maps is working:

1. **Configure Other Sources** (optional):
   - Justdial (requires implementation)
   - IndiaMART (requires business account)
   - Facebook (requires app registration)

2. **Set Up Automation**:
   - Schedule weekly discovery jobs
   - Auto-assign leads to sales reps
   - Set up WhatsApp outreach

3. **Monitor ROI**:
   - Track conversion rates
   - Calculate cost per lead
   - Optimize qualification rules

---

## 📞 Support

If you encounter issues:
1. Check the backend logs: `apps/backend/` console
2. Verify API key in database
3. Check Google Cloud Console for API errors
4. Review qualification rules

**Happy Lead Hunting! 🎯**
