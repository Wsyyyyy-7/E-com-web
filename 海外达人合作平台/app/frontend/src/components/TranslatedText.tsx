import { useTranslatedText } from '../hooks/useTranslatedText';

/**
 * Renders text; when locale is "en" uses textEn if provided, else translates if CJK.
 * Use for campaign title/description. Do NOT use for merchant or creator names.
 */
export function TranslatedText({
  text,
  textEn,
  as: Tag = 'span',
  className,
  titleOnly,
}: {
  text: string | null | undefined;
  textEn?: string | null;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  titleOnly?: boolean;
}) {
  const { value, loading } = useTranslatedText(text, textEn);
  if (loading) {
    return <Tag className={className}>{titleOnly ? '…' : ''}</Tag>;
  }
  return <Tag className={className}>{value}</Tag>;
}
