import { Demo, LanguageSwitch } from '@/app/[locale]/(routes)/home/components';

export { generateHomeMetadata as generateMetadata } from '@/app/[locale]/(routes)/home/metadata';

function HomePage() {
  return <Demo languageSwitch={<LanguageSwitch />} />;
}

export default HomePage;
