"""
Translate text (e.g. Chinese campaign content) to English for EN locale display.
Uses deep-translator (Google Translate, no API key). Same logic used when saving campaign _en fields.
"""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.translate import translate_zh_to_en

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/translate", tags=["translate"])


class TranslateBody(BaseModel):
    text: str = ""


@router.post("")
def translate_to_english(body: TranslateBody):
    """
    Translate Chinese text to English for display on EN locale.
    Used for campaign title/description etc.; merchant and creator names are not translated.
    """
    text = body.text or ""
    try:
        translated = translate_zh_to_en(text)
        return {"translated": translated, "original": text}
    except Exception as e:
        logger.exception("Translate error")
        raise HTTPException(status_code=500, detail="Translation failed") from e
