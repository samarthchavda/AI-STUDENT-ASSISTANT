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
        with smtplib.SMTP(settings.mail_server, settings.mail_port, timeout=3) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.mail_username, settings.mail_password)
            server.sendmail(settings.mail_from or settings.mail_username, [email], msg.as_string())
        logger.info("OTP email sent to %s", email)
    except Exception as exc:
        logger.error("Failed to send OTP email to %s: %s", email, exc)
        raise RuntimeError("Could not deliver OTP email. Please try again later.") from exc


def send_welcome_email(email: str, name: str) -> None:
    """
    Send a welcome email to newly registered users.
    
    When SMTP credentials are not configured, logs to console for development.
    """
    subject = f"Welcome to {settings.mail_from_name}! 🎉"
    
    # HTML email body
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .button {{
                display: inline-block;
                padding: 12px 30px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .features {{
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }}
            .feature-item {{
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }}
            .feature-item:last-child {{
                border-bottom: none;
            }}
            .footer {{
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 30px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to {settings.mail_from_name}!</h1>
            <p>Your journey to placement success starts here</p>
        </div>
        <div class="content">
            <h2>Hi {name},</h2>
            <p>Thank you for registering with <strong>{settings.mail_from_name}</strong>! We're excited to have you on board.</p>
            
            <p>You now have access to our comprehensive placement preparation platform designed specifically for engineering students.</p>
            
            <div class="features">
                <h3>🚀 What You Can Do:</h3>
                <div class="feature-item">
                    <strong>📝 Aptitude Tests</strong> - Practice company-specific mock tests for TCS, Infosys, Amazon, and more
                </div>
                <div class="feature-item">
                    <strong>💻 DSA & Coding Help</strong> - Get AI-powered hints and solutions for coding problems
                </div>
                <div class="feature-item">
                    <strong>📄 Resume Analysis</strong> - Get instant ATS score and improvement suggestions
                </div>
                <div class="feature-item">
                    <strong>🎯 Interview Preparation</strong> - Practice company-specific interview questions
                </div>
                <div class="feature-item">
                    <strong>🤖 AI Copilot</strong> - Chat with our AI for personalized guidance
                </div>
            </div>
            
            <p>Ready to start your preparation?</p>
            <center>
                <a href="http://localhost:3000/dashboard" class="button">Go to Dashboard</a>
            </center>
            
            <p><strong>Pro Tip:</strong> Start with an aptitude test to assess your current level, then use our AI copilot to create a personalized study plan!</p>
            
            <p>If you have any questions or need help, feel free to reach out to us.</p>
            
            <p>Best of luck with your placement preparation!</p>
            
            <p>Warm regards,<br>
            <strong>The {settings.mail_from_name} Team</strong></p>
        </div>
        <div class="footer">
            <p>© 2024 {settings.mail_from_name}. All rights reserved.</p>
            <p>This email was sent to {email} because you registered on our platform.</p>
        </div>
    </body>
    </html>
    """
    
    # Plain text fallback
    text_body = f"""
    Welcome to {settings.mail_from_name}!
    
    Hi {name},
    
    Thank you for registering with {settings.mail_from_name}! We're excited to have you on board.
    
    You now have access to our comprehensive placement preparation platform designed specifically for engineering students.
    
    What You Can Do:
    
    📝 Aptitude Tests - Practice company-specific mock tests for TCS, Infosys, Amazon, and more
    💻 DSA & Coding Help - Get AI-powered hints and solutions for coding problems
    📄 Resume Analysis - Get instant ATS score and improvement suggestions
    🎯 Interview Preparation - Practice company-specific interview questions
    🤖 AI Copilot - Chat with our AI for personalized guidance
    
    Ready to start your preparation? Visit your dashboard to get started!
    
    Pro Tip: Start with an aptitude test to assess your current level, then use our AI copilot to create a personalized study plan!
    
    If you have any questions or need help, feel free to reach out to us.
    
    Best of luck with your placement preparation!
    
    Warm regards,
    The {settings.mail_from_name} Team
    
    ---
    © 2024 {settings.mail_from_name}. All rights reserved.
    This email was sent to {email} because you registered on our platform.
    """

    if not settings.mail_username or not settings.mail_password:
        # Mock / development mode — print to console instead of sending
        logger.warning(
            "[MOCK EMAIL] Welcome Email\nTo: %s\nSubject: %s\n%s", 
            email, subject, text_body
        )
        return

    sender = f"{settings.mail_from_name} <{settings.mail_from or settings.mail_username}>"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = email
    
    # Attach both plain text and HTML versions
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.mail_server, settings.mail_port, timeout=3) as server:
            server.ehlo()
            server.starttls()
            server.login(settings.mail_username, settings.mail_password)
            server.sendmail(settings.mail_from or settings.mail_username, [email], msg.as_string())
        logger.info("Welcome email sent to %s", email)
    except Exception as exc:
        logger.error("Failed to send welcome email to %s: %s", email, exc)
        # Don't raise exception - registration should succeed even if email fails
        pass
