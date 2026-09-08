import { Container } from '@/components/layouts/Container';
import { projectConfig } from '@/configs/project';
import { cn } from '@/lib/cn';

type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('border-t border-border', className)}>
      <Container>
        <div className="flex h-14 items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>
            {/* Server Component: evaluated at build/request time, so the year
                is only as fresh as the last deploy — fine for a copyright. */}
            © {new Date().getFullYear()} {projectConfig.name}
          </span>
        </div>
      </Container>
    </footer>
  );
}
