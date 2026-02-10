"""
Lead Aggregator Service - External API Integrations
Optimized for Google Maps API free tier (10,000 requests/month)
"""

import requests
import time
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from db_models.marketing import LeadSourceConfig, BusinessLead
from services import marketing_service
import logging

logger = logging.getLogger(__name__)


class GoogleMapsLeadAggregator:
    """Google Maps Places API integration optimized for free tier"""
    
    def __init__(self, db: Session):
        self.db = db
        self.config = self._get_config()
        self.base_url = "https://maps.googleapis.com/maps/api/place"
        
    def _get_config(self) -> Optional[LeadSourceConfig]:
        """Get Google Maps source configuration"""
        return self.db.query(LeadSourceConfig).filter(
            LeadSourceConfig.source_name == "Google Maps",
            LeadSourceConfig.is_active == True
        ).first()
    
    def _check_quota(self) -> bool:
        """Check if daily quota is available"""
        if not self.config:
            logger.error("Google Maps API not configured")
            return False
        
        # Reset daily counter if it's a new day
        if self.config.last_request_at:
            last_request_date = self.config.last_request_at.date()
            today = datetime.utcnow().date()
            if last_request_date < today:
                self.config.requests_today = 0
                self.db.commit()
        
        # Check quota
        if self.config.requests_today >= self.config.daily_quota:
            logger.warning(f"Daily quota exceeded: {self.config.requests_today}/{self.config.daily_quota}")
            return False
        
        return True
    
    def _increment_quota(self):
        """Increment API request counter"""
        if self.config:
            self.config.requests_today += 1
            self.config.last_request_at = datetime.utcnow()
            self.db.commit()
    
    def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Optional[Dict]:
        """Make API request with error handling and quota tracking"""
        if not self._check_quota():
            return None
        
        params['key'] = self.config.api_key
        url = f"{self.base_url}/{endpoint}/json"
        
        try:
            response = requests.get(url, params=params, timeout=10)
            self._increment_quota()
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'OK':
                    return data
                else:
                    logger.error(f"API error: {data.get('status')} - {data.get('error_message')}")
            else:
                logger.error(f"HTTP error: {response.status_code}")
        except Exception as e:
            logger.error(f"Request failed: {str(e)}")
        
        return None
    
    def discover_leads(
        self,
        city: str,
        category: Optional[str] = None,
        radius: int = 5000,
        max_results: int = 100
    ) -> Dict[str, Any]:
        """
        Discover business leads from Google Maps
        
        Optimization strategy:
        1. Use Text Search to find businesses (cheaper)
        2. Only fetch Place Details for qualified leads
        3. Use field masks to request only needed fields (Essentials tier)
        4. Check for duplicates before fetching details
        """
        
        if not self.config or not self.config.api_key:
            return {
                'status': 'error',
                'message': 'Google Maps API key not configured',
                'total_found': 0,
                'total_qualified': 0,
                'total_created': 0
            }
        
        results = {
            'status': 'running',
            'total_found': 0,
            'total_qualified': 0,
            'total_created': 0,
            'leads': []
        }
        
        # Build search query
        query = f"{category} in {city}" if category else f"businesses in {city}"
        
        # Step 1: Text Search to get place IDs (cheaper than Nearby Search)
        search_params = {
            'query': query,
            'region': 'in',  # India
        }
        
        search_data = self._make_request('textsearch', search_params)
        if not search_data:
            results['status'] = 'error'
            results['message'] = 'Failed to fetch search results'
            return results
        
        places = search_data.get('results', [])
        results['total_found'] = len(places)
        
        # Step 2: Process each place
        created_count = 0
        qualified_count = 0
        
        for place in places[:max_results]:
            if created_count >= max_results:
                break
            
            # Quick qualification check from search results
            rating = place.get('rating', 0)
            review_count = place.get('user_ratings_total', 0)
            
            # Pre-filter based on basic criteria
            if rating < 4.0 or review_count < 50:
                continue
            
            qualified_count += 1
            
            # Check for duplicate before fetching details
            place_id = place.get('place_id')
            existing = self.db.query(BusinessLead).filter(
                BusinessLead.google_place_id == place_id
            ).first()
            
            if existing:
                logger.info(f"Skipping duplicate: {place.get('name')}")
                continue
            
            # Step 3: Fetch Place Details with field mask (Essentials tier - $5/1K)
            # Only request fields we actually need
            details = self._get_place_details(place_id)
            if not details:
                continue
            
            # Step 4: Create lead
            lead_data = self._parse_place_details(details)
            if lead_data:
                try:
                    # Check qualification rules
                    if marketing_service.qualify_lead(self.db, lead_data):
                        lead = marketing_service.create_lead(self.db, lead_data)
                        results['leads'].append(lead.id)
                        created_count += 1
                        logger.info(f"Created lead: {lead.business_name}")
                except Exception as e:
                    logger.error(f"Failed to create lead: {str(e)}")
            
            # Rate limiting - be respectful to API
            time.sleep(0.1)
        
        results['total_qualified'] = qualified_count
        results['total_created'] = created_count
        results['status'] = 'completed'
        results['message'] = f"Successfully discovered {created_count} new leads"
        
        # Update last sync time
        self.config.last_sync_at = datetime.utcnow()
        self.db.commit()
        
        return results
    
    def _get_place_details(self, place_id: str) -> Optional[Dict]:
        """
        Fetch place details with optimized field mask
        Uses Essentials tier ($5/1K after 10K free)
        """
        # Only request fields we need - reduces cost
        fields = [
            'name',
            'formatted_phone_number',
            'international_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'formatted_address',
            'address_components',
            'geometry',
            'types',
            'url'  # Google Maps URL
        ]
        
        params = {
            'place_id': place_id,
            'fields': ','.join(fields),
            'region': 'in'
        }
        
        data = self._make_request('details', params)
        if data and 'result' in data:
            return data['result']
        
        return None
    
    def _parse_place_details(self, details: Dict) -> Optional[Dict[str, Any]]:
        """Parse Google Maps place details into lead data"""
        try:
            # Extract address components
            address_components = details.get('address_components', [])
            city = None
            state = None
            pincode = None
            
            for component in address_components:
                types = component.get('types', [])
                if 'locality' in types:
                    city = component.get('long_name')
                elif 'administrative_area_level_1' in types:
                    state = component.get('long_name')
                elif 'postal_code' in types:
                    pincode = component.get('long_name')
            
            # Determine category from types
            types = details.get('types', [])
            category = types[0].replace('_', ' ').title() if types else 'Business'
            
            # Check if has website
            website_url = details.get('website')
            has_website = bool(website_url)
            
            # Get phone number
            phone = details.get('formatted_phone_number') or details.get('international_phone_number')
            
            # Build lead data
            lead_data = {
                'business_name': details.get('name'),
                'category': category,
                'source': 'Google Maps',
                'phone': phone,
                'email': None,  # Google Maps doesn't provide email
                'address': details.get('formatted_address'),
                'city': city,
                'state': state,
                'pincode': pincode,
                'rating': details.get('rating', 0.0),
                'review_count': details.get('user_ratings_total', 0),
                'has_website': has_website,
                'website_url': website_url,
                'google_maps_url': details.get('url'),
                'google_place_id': details.get('place_id'),
                'latitude': details.get('geometry', {}).get('location', {}).get('lat'),
                'longitude': details.get('geometry', {}).get('location', {}).get('lng'),
            }
            
            return lead_data
            
        except Exception as e:
            logger.error(f"Failed to parse place details: {str(e)}")
            return None


def discover_google_maps_leads(
    db: Session,
    city: str,
    category: Optional[str] = None,
    radius: int = 5000,
    max_results: int = 100
) -> Dict[str, Any]:
    """
    Main function to discover leads from Google Maps
    
    Args:
        db: Database session
        city: City to search in
        category: Business category (optional)
        radius: Search radius in meters (default: 5000)
        max_results: Maximum number of leads to create (default: 100)
    
    Returns:
        Dictionary with discovery results
    """
    aggregator = GoogleMapsLeadAggregator(db)
    return aggregator.discover_leads(city, category, radius, max_results)



class OpenStreetMapLeadAggregator:
    """
    OpenStreetMap Integration.
    Supports:
    1. Free Nominatim API (No Key) - strictly rate limited
    2. Geoapify API (With Key) - higher limits, reliable
    """
    
    def __init__(self, db: Session):
        self.db = db
        # Check for API key in config
        self.config = self.db.query(LeadSourceConfig).filter(
            LeadSourceConfig.source_name == "OpenStreetMap"
        ).first()
        
        self.api_key = self.config.api_key if self.config and self.config.api_key else None
        
        if self.api_key and len(self.api_key) == 32:
            # Assume Geoapify if key is present (standard 32 char hex)
            self.provider = "geoapify"
            self.base_url = "https://api.geoapify.com/v1/geocode/search"
        else:
            self.provider = "nominatim"
            self.base_url = "https://nominatim.openstreetmap.org/search"
            
        self.headers = {
            'User-Agent': 'GrowEasy-LeadAggregator/1.0 (contact@groweasy.app)'
        }
        
    def discover_leads(
        self,
        city: str,
        category: Optional[str] = None,
        max_results: int = 50
    ) -> Dict[str, Any]:
        
        if self.provider == "geoapify":
            return self._discover_via_geoapify(city, category, max_results)
        else:
            return self._discover_via_nominatim(city, category, max_results)

    def _discover_via_geoapify(self, city: str, category: str, max_results: int) -> Dict[str, Any]:
        """Discover using Geoapify API"""
        results = {
            'status': 'running',
            'total_found': 0, 
            'total_qualified': 0, 
            'total_created': 0, 
            'leads': []
        }
        
        # Geoapify Search
        query = f"{category} in {city}" if category else f"businesses in {city}"
        params = {
            'text': query,
            'apiKey': self.api_key,
            'limit': max_results,
            'format': 'json'
        }
        
        try:
            response = requests.get(self.base_url, params=params, timeout=30)
            
            if response.status_code != 200:
                results['status'] = 'error'
                results['message'] = f"Geoapify Error: {response.status_code}"
                return results
                
            data = response.json()
            places = data.get('results', [])
            results['total_found'] = len(places)
            
            created_count = 0
            
            for place in places:
                try:
                    # Geoapify returns different structure
                    # Check for duplicate
                    place_id = str(place.get('place_id'))
                    
                    # Basic details
                    business_name = place.get('name')
                    # Fallback name if missing (common in geocoders)
                    if not business_name:
                         business_name = place.get('address_line1', '').split(',')[0]
                         
                    if not business_name:
                        continue
                        
                    # Extract address components
                    city_val = place.get('city')
                    state_val = place.get('state')
                    pincode = place.get('postcode')
                    full_address = place.get('formatted')
                    
                    website = place.get('website')
                    phone = place.get('datasource', {}).get('raw', {}).get('phone')
                    
                    lead_data = {
                        'business_name': business_name,
                        'category': category or place.get('category', 'Business').title(),
                        'source': 'OpenStreetMap', # Still Source=OSM for user consistency
                        'phone': phone,
                        'email': None,
                        'address': full_address,
                        'city': city_val,
                        'state': state_val,
                        'pincode': pincode,
                        'rating': 0.0,
                        'review_count': 0,
                        'has_website': bool(website),
                        'website_url': website,
                        'google_maps_url': f"https://www.openstreetmap.org/node/{place.get('osm_id')}" if place.get('osm_id') else None,
                        'latitude': place.get('lat'),
                        'longitude': place.get('lon'),
                        # Store specific ID to prevent duplicates
                        'google_place_id': f"geoapify_{place_id}" 
                    }
                    
                    # Bypass qualification for OSM as it often lacks phone/website
                    # if marketing_service.qualify_lead(self.db, lead_data):
                    lead = marketing_service.create_lead(self.db, lead_data)
                    results['leads'].append(lead.id)
                    created_count += 1
                    logger.info(f"Created Geoapify lead: {lead.business_name}")
                        
                except Exception as e:
                    logger.error(f"Failed to process Geoapify place: {str(e)}")
                    continue
                    
            results['total_qualified'] = created_count
            results['total_created'] = created_count
            results['status'] = 'completed'
            results['message'] = f"Successfully discovered {created_count} leads via Geoapify"
            return results
            
        except Exception as e:
            logger.error(f"Geoapify Failed: {str(e)}")
            results['status'] = 'error'
            results['message'] = f"Geoapify Error: {str(e)}"
            return results

    def _discover_via_nominatim(self, city: str, category: str, max_results: int) -> Dict[str, Any]:
        """Existing Nominatim logic"""
        results = {
            'status': 'running',
            'total_found': 0,
            'total_qualified': 0,
            'total_created': 0,
            'leads': []
        }
        
        # Build query
        query = f"{category} in {city}" if category else f"businesses in {city}"
        
        params = {
            'q': query,
            'format': 'json',
            'addressdetails': 1,
            'limit': max_results,
            'extratags': 1
        }
        
        try:
            time.sleep(1) # Rate limit
            response = requests.get(self.base_url, params=params, headers=self.headers, timeout=30)
            
            if response.status_code != 200:
                results['status'] = 'error'
                results['message'] = f"Nominatim API error: {response.status_code}"
                return results
                
            places = response.json()
            
            if not isinstance(places, list):
                 # Handle error object...
                 results['status'] = 'error'
                 results['message'] = "Invalid Nominatim response"
                 return results

            results['total_found'] = len(places)
            created_count = 0
            
            for place in places:
                try:
                    if not place.get('osm_id'): continue
                    
                    osm_id = str(place.get('osm_id'))
                    address = place.get('address', {})
                    extratags = place.get('extratags', {})
                    
                    business_name = place.get('name') or address.get('amenity') or address.get('shop')
                    if not business_name: continue
                    
                    phone = extratags.get('phone') or extratags.get('contact:phone')
                    website = extratags.get('website') or extratags.get('contact:website')
                    
                    try:
                        lat = float(place.get('lat')) if place.get('lat') else None
                        lon = float(place.get('lon')) if place.get('lon') else None
                    except:
                        lat, lon = None, None

                    lead_data = {
                        'business_name': business_name,
                        'category': category or place.get('type', 'Business').title(),
                        'source': 'OpenStreetMap',
                        'phone': phone,
                        'email': extratags.get('email'),
                        'address': place.get('display_name'),
                        'city': address.get('city') or address.get('town'),
                        'state': address.get('state'),
                        'pincode': address.get('postcode'),
                        'rating': 0.0,
                        'review_count': 0,
                        'has_website': bool(website),
                        'website_url': website,
                        'google_maps_url': f"https://www.openstreetmap.org/{place.get('osm_type')}/{osm_id}",
                        'latitude': lat,
                        'longitude': lon,
                        'google_place_id': f"osm_{osm_id}"
                    }
                    
                    if marketing_service.qualify_lead(self.db, lead_data):
                        lead = marketing_service.create_lead(self.db, lead_data)
                        results['leads'].append(lead.id)
                        created_count += 1
                        
                except Exception as e:
                    continue
            
            results['total_qualified'] = created_count
            results['total_created'] = created_count
            results['status'] = 'completed'
            results['message'] = f"Successfully discovered {created_count} leads (Free Tier)"
            
        except Exception as e:
            results['status'] = 'error'
            results['message'] = f"Nominatim Error: {str(e)}"
            
        return results


def discover_openstreetmap_leads(
    db: Session,
    city: str,
    category: Optional[str] = None,
    max_results: int = 50,
    **kwargs
) -> Dict[str, Any]:
    """
    Discover leads from OpenStreetMap
    """
    aggregator = OpenStreetMapLeadAggregator(db)
    return aggregator.discover_leads(city, category, max_results)


def discover_justdial_leads(db: Session, city: str, category: Optional[str] = None) -> Dict[str, Any]:
    """Justdial integration - To be implemented"""
    return {
        'status': 'not_implemented',
        'message': 'Justdial integration coming soon',
        'total_found': 0,
        'total_qualified': 0,
        'total_created': 0
    }


def discover_indiamart_leads(db: Session, category: Optional[str] = None, city: Optional[str] = None) -> Dict[str, Any]:
    """IndiaMART integration - To be implemented"""
    return {
        'status': 'not_implemented',
        'message': 'IndiaMART integration coming soon',
        'total_found': 0,
        'total_qualified': 0,
        'total_created': 0
    }


def discover_facebook_leads(db: Session, location: str, category: Optional[str] = None) -> Dict[str, Any]:
    """Facebook Business Pages integration - To be implemented"""
    return {
        'status': 'not_implemented',
        'message': 'Facebook integration coming soon',
        'total_found': 0,
        'total_qualified': 0,
        'total_created': 0
    }
