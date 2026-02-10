import { generateHomeMetadata } from '@/app/[locale]/(routes)/home/metadata';

import Welcome from '@/app/[locale]/(routes)/home/components/Welcome';
import { LanguageSwitch } from '@/app/[locale]/(routes)/home/components';

export const generateMetadata = generateHomeMetadata;

function HomePage() {
  return <Welcome languageSwitch={<LanguageSwitch />} />;
}

export default HomePage;
