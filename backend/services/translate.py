"""
Shared translation for campaign content. Uses deep_translator (Google Translate, no API key).
Used at campaign publish time to store English versions for /en locale.
"""
import json
import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

_CJK_PATTERN = re.compile(r"[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uff00-\uffef]")


def has_cjk(text: str) -> bool:
    """Return True if text contains CJK characters."""
    if not text or not isinstance(text, str):
        return False
    return bool(_CJK_PATTERN.search(text))


def translate_zh_to_en(text: str) -> str:
    """Translate Chinese (and similar CJK) text to English. Returns original if empty or on error."""
    if not (text or "").strip():
        return (text or "").strip()
    try:
        from deep_translator import GoogleTranslator
        out = GoogleTranslator(source="zh-CN", target="en").translate((text or "").strip())
        return out or text
    except Exception as e:
        logger.warning("Translation failed for %r: %s", text[:50], e)
        return text.strip()


def translate_campaign_to_english(
    title: str,
    description: Any,
    conditions_json: Any,
    milestones_json: Any,
) -> dict:
    """
    Produce title_en, description_en, conditions_en, milestones_en.
    Only translates when content has CJK; otherwise copies or leaves empty.
    """
    out = {}
    if title and has_cjk(title):
        out["title_en"] = translate_zh_to_en(title)
    if description and has_cjk(description):
        out["description_en"] = translate_zh_to_en(description)
    if conditions_json:
        try:
            arr = json.loads(conditions_json)
            if isinstance(arr, list) and arr:
                en_list = [translate_zh_to_en(str(x)) if has_cjk(str(x)) else str(x) for x in arr]
                out["conditions_en"] = json.dumps(en_list, ensure_ascii=False)
        except (json.JSONDecodeError, TypeError):
            pass
    if milestones_json:
        try:
            arr = json.loads(milestones_json)
            if isinstance(arr, list) and arr:
                en_milestones = []
                for m in arr:
                    if isinstance(m, dict) and "name" in m:
                        name = m.get("name") or ""
                        en_milestones.append({
                            "name": translate_zh_to_en(str(name)) if has_cjk(str(name)) else str(name),
                            "percent": m.get("percent", 0),
                        })
                    else:
                        en_milestones.append(m)
                if en_milestones:
                    out["milestones_en"] = json.dumps(en_milestones, ensure_ascii=False)
        except (json.JSONDecodeError, TypeError):
            pass
    return out
