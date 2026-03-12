import { setRequestLocale } from 'next-intl/server';

import { generateTemplateMetadata } from '@/app/[locale]/(routes)/template/metadata';

export const generateMetadata = generateTemplateMetadata;

type Props = {
  params: Promise<{ locale: string }>;
};

async function TemplatePage({ params }: Props) {
  const { locale } = await params;
  await setRequestLocale(locale);

  return <>Template Page</>;
}

export default TemplatePage;
