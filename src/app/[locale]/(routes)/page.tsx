import { generateHomeMetadata } from '@routes/home/metadata';

import { LanguageSwitch } from '@routes/home/components';

export const generateMetadata = generateHomeMetadata;

function HomePage() {
  return (
    <div>
      <div>HomePage</div>

      <LanguageSwitch />
    </div>
  );
}

export default HomePage;
