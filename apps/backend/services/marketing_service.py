from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from db_models.marketing import (
    BusinessLead, LeadActivity, LeadQualificationRule, 
    CategoryWeight, LeadSourceConfig, LeadStatusType
)
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import hashlib
import json


def generate_duplicate_hash(business_name: str, phone: str) -> str:
    """Generate hash for duplicate detection based on business name and phone"""
    if not business_name or not phone:
        return None
    
    # Normalize: lowercase, remove spaces
    normalized = f"{business_name.lower().strip()}{phone.strip()}"
    return hashlib.sha256(normalized.encode()).hexdigest()


def calculate_lead_score(
    db: Session,
    rating: float = 0.0,
    review_count: int = 0,
    category: str = None,
    source: str = None
) -> int:
    """
    Calculate lead score based on multiple factors
    Formula: (Rating × 20) + (Review Count × 0.2) + Category Weight + Source Weight
    """
    score = 0
    
    # Rating contribution (max 100 points for 5-star rating)
    score += int(rating * 20)
    
    # Review count contribution (capped at 100 points)
    score += min(int(review_count * 0.2), 100)
    
    # Category weight
    if category:
        category_weight = db.query(CategoryWeight).filter(
            CategoryWeight.category == category,
            CategoryWeight.is_active == True
        ).first()
        if category_weight:
            score += category_weight.weight
    
    # Source weight
    if source:
        source_config = db.query(LeadSourceConfig).filter(
            LeadSourceConfig.source_name == source,
            LeadSourceConfig.is_active == True
        ).first()
        if source_config:
            score += source_config.source_weight
    
    return score


def qualify_lead(db: Session, lead_data: Dict[str, Any]) -> bool:
    """
    Check if lead meets qualification criteria based on active rules
    """
    # Get active qualification rules
    rules = db.query(LeadQualificationRule).filter(
        LeadQualificationRule.is_active == True
    ).all()
    
    if not rules:
        return True  # No rules = all leads qualify
    
    # Check against each active rule (OR logic - pass any rule)
    for rule in rules:
        passes = True
        
        # Check minimum rating
        if lead_data.get('rating', 0) < rule.min_rating:
            passes = False
        
        # Check minimum reviews
        if lead_data.get('review_count', 0) < rule.min_reviews:
            passes = False
        
        # Check website requirement (website_required=True means lead must NOT have website)
        if rule.website_required and lead_data.get('has_website', False):
            passes = False
        
        # Check phone requirement
        if rule.phone_required and not lead_data.get('phone'):
            passes = False
        
        # Check excluded categories
        if rule.excluded_categories:
            try:
                excluded = json.loads(rule.excluded_categories)
                if lead_data.get('category') in excluded:
                    passes = False
            except:
                pass
        
        if passes:
            return True  # Passed at least one rule
    
    return False


def find_duplicates(db: Session, business_name: str, phone: str) -> Optional[BusinessLead]:
    """Find duplicate lead based on hash"""
    if not business_name or not phone:
        return None
    
    duplicate_hash = generate_duplicate_hash(business_name, phone)
    if not duplicate_hash:
        return None
    
    return db.query(BusinessLead).filter(
        BusinessLead.duplicate_hash == duplicate_hash
    ).first()


def create_lead(db: Session, lead_data: Dict[str, Any], user_id: str = None) -> BusinessLead:
    """Create a new business lead with duplicate detection and scoring"""
    
    # Check for duplicates
    existing = find_duplicates(
        db, 
        lead_data.get('business_name'), 
        lead_data.get('phone')
    )
    if existing:
        # Update existing lead instead of creating duplicate
        return update_lead(db, existing.id, lead_data, user_id)
    
    # Generate duplicate hash
    duplicate_hash = generate_duplicate_hash(
        lead_data.get('business_name'),
        lead_data.get('phone')
    )
    
    # Calculate lead score
    lead_score = calculate_lead_score(
        db,
        rating=lead_data.get('rating', 0.0),
        review_count=lead_data.get('review_count', 0),
        category=lead_data.get('category'),
        source=lead_data.get('source')
    )
    
    # Create lead
    lead = BusinessLead(
        **lead_data,
        duplicate_hash=duplicate_hash,
        lead_score=lead_score,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(lead)
    db.commit()
    db.refresh(lead)
    
    # Log creation activity
    activity = LeadActivity(
        lead_id=lead.id,
        activity_type="Note",
        subject="Lead Created",
        notes=f"Lead created from {lead_data.get('source', 'Manual')}",
        created_by=user_id,
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    
    return lead


def get_leads(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    filters: Dict[str, Any] = None
) -> List[BusinessLead]:
    """Get leads with filtering and pagination"""
    query = db.query(BusinessLead)
    
    if filters:
        # Status filter
        if filters.get('status'):
            query = query.filter(BusinessLead.lead_status == filters['status'])
        
        # Source filter
        if filters.get('source'):
            query = query.filter(BusinessLead.source == filters['source'])
        
        # City filter
        if filters.get('city'):
            query = query.filter(BusinessLead.city == filters['city'])
        
        # Category filter
        if filters.get('category'):
            query = query.filter(BusinessLead.category == filters['category'])
        
        # Score range filter
        if filters.get('min_score'):
            query = query.filter(BusinessLead.lead_score >= filters['min_score'])
        if filters.get('max_score'):
            query = query.filter(BusinessLead.lead_score <= filters['max_score'])
        
        # Assigned to filter
        if filters.get('assigned_to'):
            query = query.filter(BusinessLead.assigned_to == filters['assigned_to'])
        
        # Website filter
        if filters.get('has_website') is not None:
            query = query.filter(BusinessLead.has_website == filters['has_website'])
        
        # Search filter (business name or phone)
        if filters.get('search'):
            search_term = f"%{filters['search']}%"
            query = query.filter(
                or_(
                    BusinessLead.business_name.ilike(search_term),
                    BusinessLead.phone.ilike(search_term)
                )
            )
    
    # Order by score descending, then created_at descending
    query = query.order_by(BusinessLead.lead_score.desc(), BusinessLead.created_at.desc())
    
    return query.offset(skip).limit(limit).all()


def get_lead_by_id(db: Session, lead_id: int) -> Optional[BusinessLead]:
    """Get single lead by ID"""
    return db.query(BusinessLead).filter(BusinessLead.id == lead_id).first()


def update_lead(db: Session, lead_id: int, lead_data: Dict[str, Any], user_id: str = None) -> BusinessLead:
    """Update lead information"""
    lead = get_lead_by_id(db, lead_id)
    if not lead:
        return None
    
    old_status = lead.lead_status
    
    # Update fields
    for key, value in lead_data.items():
        if hasattr(lead, key):
            setattr(lead, key, value)
    
    # Recalculate score if relevant fields changed
    if any(k in lead_data for k in ['rating', 'review_count', 'category', 'source']):
        lead.lead_score = calculate_lead_score(
            db,
            rating=lead.rating,
            review_count=lead.review_count,
            category=lead.category,
            source=lead.source
        )
    
    lead.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(lead)
    
    # Log status change if status was updated
    if 'lead_status' in lead_data and old_status != lead.lead_status:
        activity = LeadActivity(
            lead_id=lead.id,
            activity_type="Status Change",
            subject="Status Updated",
            notes=f"Status changed from {old_status} to {lead.lead_status}",
            old_status=old_status,
            new_status=lead.lead_status,
            created_by=user_id,
            created_at=datetime.utcnow()
        )
        db.add(activity)
        db.commit()
    
    return lead


def delete_lead(db: Session, lead_id: int) -> bool:
    """Delete a lead"""
    lead = get_lead_by_id(db, lead_id)
    if not lead:
        return False
    
    db.delete(lead)
    db.commit()
    return True


def assign_lead(db: Session, lead_id: int, user_id: str, assigned_by: str = None) -> BusinessLead:
    """Assign lead to a sales rep"""
    lead = get_lead_by_id(db, lead_id)
    if not lead:
        return None
    
    old_assignee = lead.assigned_to
    lead.assigned_to = user_id
    lead.assigned_at = datetime.utcnow()
    lead.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(lead)
    
    # Log assignment activity
    activity = LeadActivity(
        lead_id=lead.id,
        activity_type="Note",
        subject="Lead Assigned",
        notes=f"Lead assigned to user {user_id}" + (f" by {assigned_by}" if assigned_by else ""),
        created_by=assigned_by,
        created_at=datetime.utcnow()
    )
    db.add(activity)
    db.commit()
    
    return lead


def log_activity(db: Session, activity_data: Dict[str, Any]) -> LeadActivity:
    """Log an activity for a lead"""
    activity = LeadActivity(**activity_data, created_at=datetime.utcnow())
    db.add(activity)
    
    # Update last_contacted_at if it's a call or meeting
    if activity_data.get('activity_type') in ['Call', 'Meeting']:
        lead = get_lead_by_id(db, activity_data['lead_id'])
        if lead:
            lead.last_contacted_at = datetime.utcnow()
            lead.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(activity)
    return activity


def get_lead_activities(db: Session, lead_id: int) -> List[LeadActivity]:
    """Get all activities for a lead"""
    return db.query(LeadActivity).filter(
        LeadActivity.lead_id == lead_id
    ).order_by(LeadActivity.created_at.desc()).all()


def auto_assign_leads(db: Session, unassigned_only: bool = True) -> int:
    """Auto-assign leads using round-robin logic"""
    # Get unassigned leads
    query = db.query(BusinessLead)
    if unassigned_only:
        query = query.filter(BusinessLead.assigned_to == None)
    
    leads = query.order_by(BusinessLead.lead_score.desc()).all()
    
    if not leads:
        return 0
    
    # Get active sales users (simplified - you may want to filter by role)
    # For now, we'll skip auto-assignment logic and return 0
    # This would require user role management
    
    return 0


def reassign_stale_leads(db: Session, days_threshold: int = 7) -> int:
    """Reassign leads with no activity for X days"""
    threshold_date = datetime.utcnow() - timedelta(days=days_threshold)
    
    # Find stale leads
    stale_leads = db.query(BusinessLead).filter(
        BusinessLead.lead_status.in_(['New', 'Contacted']),
        or_(
            BusinessLead.last_contacted_at < threshold_date,
            and_(
                BusinessLead.last_contacted_at == None,
                BusinessLead.created_at < threshold_date
            )
        )
    ).all()
    
    # For now, just return count
    # Actual reassignment would require user management logic
    return len(stale_leads)


def get_lead_analytics(db: Session, filters: Dict[str, Any] = None) -> Dict[str, Any]:
    """Get analytics data for dashboard"""
    query = db.query(BusinessLead)
    
    # Apply filters if provided
    if filters:
        if filters.get('start_date'):
            query = query.filter(BusinessLead.created_at >= filters['start_date'])
        if filters.get('end_date'):
            query = query.filter(BusinessLead.created_at <= filters['end_date'])
    
    total_leads = query.count()
    
    # Leads by status
    status_counts = db.query(
        BusinessLead.lead_status,
        func.count(BusinessLead.id)
    ).group_by(BusinessLead.lead_status).all()
    
    # Leads by source
    source_counts = db.query(
        BusinessLead.source,
        func.count(BusinessLead.id)
    ).group_by(BusinessLead.source).all()
    
    # Conversion rate
    won_count = db.query(BusinessLead).filter(
        BusinessLead.lead_status == LeadStatusType.WON
    ).count()
    conversion_rate = (won_count / total_leads * 100) if total_leads > 0 else 0
    
    # Average lead score
    avg_score = db.query(func.avg(BusinessLead.lead_score)).scalar() or 0
    
    return {
        'total_leads': total_leads,
        'by_status': dict(status_counts),
        'by_source': dict(source_counts),
        'conversion_rate': round(conversion_rate, 2),
        'average_score': round(avg_score, 2),
        'won_leads': won_count
    }


def get_conversion_funnel(db: Session) -> List[Dict[str, Any]]:
    """Get conversion funnel data"""
    statuses = ['New', 'Contacted', 'Interested', 'Proposal Sent', 'Won']
    funnel_data = []
    
    for status in statuses:
        count = db.query(BusinessLead).filter(
            BusinessLead.lead_status == status
        ).count()
        funnel_data.append({
            'stage': status,
            'count': count
        })
    
    return funnel_data


def get_source_performance(db: Session) -> List[Dict[str, Any]]:
    """Get performance metrics by source"""
    sources = db.query(BusinessLead.source).distinct().all()
    performance = []
    
    for (source,) in sources:
        total = db.query(BusinessLead).filter(BusinessLead.source == source).count()
        won = db.query(BusinessLead).filter(
            BusinessLead.source == source,
            BusinessLead.lead_status == LeadStatusType.WON
        ).count()
        
        conversion_rate = (won / total * 100) if total > 0 else 0
        
        performance.append({
            'source': source,
            'total_leads': total,
            'won_leads': won,
            'conversion_rate': round(conversion_rate, 2)
        })
    
    return performance
