import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_otp_email(email: str, otp: str) -> None:
    """
    Send a password-reset OTP to the given email address.

    When SMTP credentials (mail_username / mail_password) are not configured,
    the function falls back to logging the OTP to the console so the flow
    can still be tested in development without a real mail server.
    """
    subject = f"{settings.mail_from_name} — Password Reset OTP"
    body = (
        f"Hello,\n\n"
        f"Your OTP for password reset is: {otp}\n\n"
        f"This OTP is valid for 10 minutes.\n"
        f"If you did not request a password reset, please ignore this email.\n\n"
        f"— {settings.mail_from_name}"
    )

    if not settings.mail_username or not settings.mail_password:
        # Mock / development mode — print to console instead of sending
        logger.warning(
            "[MOCK EMAIL] To: %s | Subject: %s\n%s", email, subject, body
        )
        return

    sender = f"{settings.mail_from_name} <{settings.mail_from or settings.mail_username}>"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = email
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.mail_server, settings.mail_port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.mail_username, settings.mail_password)
            server.sendmail(settings.mail_from or settings.mail_username, [email], msg.as_string())
        logger.info("OTP email sent to %s", email)
    except Exception as exc:
        logger.error("Failed to send OTP email to %s: %s", email, exc)
        raise RuntimeError("Could not deliver OTP email. Please try again later.") from exc
