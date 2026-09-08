import { getTranslations, setRequestLocale } from 'next-intl/server';

export { generateTemplateMetadata as generateMetadata } from '@/app/[locale]/(routes)/template/metadata';

type TemplatePageProps = {
  params: Promise<{ locale: string }>;
};

async function TemplatePage({ params }: TemplatePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('metadata.template');

  return <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>;
}

export default TemplatePage;
