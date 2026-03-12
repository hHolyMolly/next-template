import { generateHomeMetadata } from '@/app/[locale]/(routes)/home/metadata';

import { Demo, LanguageSwitch } from '@/app/[locale]/(routes)/home/components';

export const generateMetadata = generateHomeMetadata;

function HomePage() {
  return (
    <div className="wrapper">
      <main id="main-content" className="page">
        <Demo languageSwitch={<LanguageSwitch />} />
      </main>
    </div>
  );
}

export default HomePage;
