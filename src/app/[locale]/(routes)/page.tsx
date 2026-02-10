import { generateHomeMetadata } from '@/app/[locale]/(routes)/home/metadata';

import { Welcome, LanguageSwitch } from '@/app/[locale]/(routes)/home/components';

export const generateMetadata = generateHomeMetadata;

function HomePage() {
  return <Welcome languageSwitch={<LanguageSwitch />} />;
}

export default HomePage;
