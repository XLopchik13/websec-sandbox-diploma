import asyncio

import resend

from app.core.config import settings


async def _send(to: str, subject: str, html: str) -> None:
    if not settings.resend_api_key:
        return

    resend.api_key = settings.resend_api_key
    params: resend.Emails.SendParams = {
        "from": settings.email_from,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    await asyncio.to_thread(resend.Emails.send, params)


async def send_verification_email(to: str, token: str) -> None:
    link = f"{settings.app_url}?verify-token={token}"
    print(f"\n[DEV] Verification link for {to}:\n  {link}\n")
    html = f"""
    <p>Подтвердите адрес электронной почты, перейдя по ссылке:</p>
    <p><a href="{link}">{link}</a></p>
    <p>Ссылка действительна 1 час.</p>
    """
    await _send(to, "Подтверждение почты — WEBSEC", html)


async def send_password_reset_email(to: str, token: str) -> None:
    link = f"{settings.app_url}?reset-token={token}"
    print(f"\n[DEV] Password reset link for {to}:\n  {link}\n")
    html = f"""
    <p>Для смены пароля перейдите по ссылке:</p>
    <p><a href="{link}">{link}</a></p>
    <p>Ссылка действительна 1 час.</p>
    """
    await _send(to, "Смена пароля — WEBSEC", html)
