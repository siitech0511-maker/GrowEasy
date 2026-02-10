from sqlalchemy.orm import Session
from db_models.crm import Account, Opportunity, Contact
from db_models.sales import QuoteHeader, SalesOrderHeader, InvoiceHeader
from db_models.accounting import PaymentHeader
from typing import Dict

def get_customer_360(db: Session, account_id: int) -> Dict:
    """
    Unified view of a customer across CRM, Sales, and Finance.
    """
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        return None
    
    uuid = account.master_uuid
    
    # 1. CRM Data (Ops)
    opps = db.query(Opportunity).filter(Opportunity.account_id == account_id).all()
    
    # 2. Sales Data (Integrated)
    quotes = []
    orders = []
    if uuid:
        quotes = db.query(QuoteHeader).filter(QuoteHeader.customer_id == uuid).all()
        orders = db.query(SalesOrderHeader).filter(SalesOrderHeader.customer_id == uuid).all()
    
    # 3. Finance Data (Integrated)
    invoices = []
    payments = []
    if uuid:
        # Link via Order or direct customer link if available
        invoices = db.query(InvoiceHeader).join(SalesOrderHeader).filter(SalesOrderHeader.customer_id == uuid).all()
        payments = db.query(PaymentHeader).filter(PaymentHeader.payee_id == uuid).all()
        
    return {
        "account": account,
        "opportunities": opps,
        "quotations": quotes,
        "orders": orders,
        "invoices": invoices,
        "payments": payments,
        "kpis": {
            "total_purchased": sum(o.total for o in orders) if orders else 0,
            "outstanding": sum(i.total for i in invoices if i.status != "Paid") if invoices else 0,
            "win_rate": len([o for o in opps if o.stage == "Won"]) / len(opps) * 100 if opps else 0
        }
    }
