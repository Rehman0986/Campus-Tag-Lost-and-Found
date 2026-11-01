from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_finder_report_notification_email(item_id, report_id, recipient_email, item_name, message, address=None):
    """
    Sends an immediate asynchronous email notification to the item owner when
    an anonymous finder submits a recovery notice or drops a map pin.
    """
    subject = f"🚨 Campus Tag Alert: Safe Report Received for '{item_name}'"
    
    body = f"""Hello,

Great news! An individual has scanned your Campus Tag QR code and submitted a recovery report for:
Item: {item_name}

Finder's Note:
"{message}"
"""
    if address:
        body += f"\nReported Location: {address}\n"

    body += """
You can log into your Campus Tag Dashboard to view full details and communicate with the finder through our anonymous two-way relay:
https://campustag.edu/dashboard

Remember: Campus Tag masks your personal details so you can coordinate recovery safely on campus.

Best regards,
The Campus Tag Safety Team
"""

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'alerts@campustag.edu'),
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        logger.info(f"Notification email dispatched for item {item_id} to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to dispatch email for item {item_id}: {str(e)}")
        return False
