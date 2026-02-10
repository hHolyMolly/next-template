import { generateHomeMetadata } from '@/app/[locale]/(routes)/home/metadata';

import { Demo, LanguageSwitch } from '@/app/[locale]/(routes)/home/components';

export const generateMetadata = generateHomeMetadata;

function HomePage() {
  return <Demo languageSwitch={<LanguageSwitch />} />;
}

export default HomePage;
