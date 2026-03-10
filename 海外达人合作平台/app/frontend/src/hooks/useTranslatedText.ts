import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { translateToEnglish, hasCJK } from '../api/translate';

/**
 * When locale is "en": uses textEn if provided, else translates text when it contains CJK.
 * When locale is not "en": returns original text. Do NOT use for merchant/creator names.
 */
export function useTranslatedText(
  text: string | null | undefined,
  textEn?: string | null
): { value: string; loading: boolean } {
  const { i18n } = useTranslation();
  const [value, setValue] = useState(text ?? '');
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const raw = text ?? '';
    const isEn = i18n.language === 'en';
    const hasStoredEn = isEn && textEn != null && String(textEn).trim() !== '';

    if (hasStoredEn) {
      setValue(String(textEn).trim());
      setLoading(false);
      return;
    }
    if (!isEn || !raw) {
      setValue(raw);
      setLoading(false);
      return;
    }
    const needsTranslate = hasCJK(raw);
    if (!needsTranslate) {
      setValue(raw);
      setLoading(false);
      return;
    }

    setLoading(true);
    translateToEnglish(raw)
      .then((translated) => {
        if (mounted.current) {
          setValue(translated);
        }
      })
      .catch(() => {
        if (mounted.current) setValue(raw);
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });

    return () => {
      mounted.current = false;
    };
  }, [text, textEn, i18n.language]);

  return { value, loading };
}
