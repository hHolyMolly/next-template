import { getTranslations } from 'next-intl/server';

import Container from '@/components/layouts/Container';
import { projectConfig } from '@/configs/project';
import routes from '@/configs/routes';
import { cn } from '@/lib/cn';
import { Link } from '@/services/i18n/navigation';

type HeaderProps = {
  className?: string;
};

async function Header({ className }: HeaderProps) {
  const t = await getTranslations('translations.shared');

  return (
    <header className={cn('border-b border-border', className)}>
      <Container>
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href={routes.home()} className="font-semibold tracking-tight">
            {projectConfig.name}
          </Link>

          <nav aria-label="Main">
            <ul className="flex items-center gap-6 text-sm text-muted-foreground">
              <li>
                <Link href={routes.home()} className="transition-colors hover:text-foreground">
                  {t('nav_home')}
                </Link>
              </li>
              <li>
                <Link href={routes.template()} className="transition-colors hover:text-foreground">
                  {t('nav_template')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}

export default Header;
