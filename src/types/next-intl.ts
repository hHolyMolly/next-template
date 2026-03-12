import en_translations from '../../public/locales/en/translations.json';
import en_metadata from '../../public/locales/en/metadata.json';
import en_demo from '../../public/locales/en/demo.json';

type Messages = {
  translations: typeof en_translations;
  metadata: typeof en_metadata;
  demo: typeof en_demo;
};

declare module 'next-intl' {
  interface AppConfig {
    Messages: Messages;
  }
}
