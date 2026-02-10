import { generateHomeMetadata } from '@/app/(routes)/home/metadata';

import Welcome from '@/app/(routes)/home/components/Welcome';
import { LanguageSwitch } from '@/app/(routes)/home/components';

export const generateMetadata = generateHomeMetadata;

function HomePage() {
  return <Welcome languageSwitch={<LanguageSwitch />} />;
}

export default HomePage;
