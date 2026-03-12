import Container from '@/components/layouts/Container';
import { cn } from '@/lib/cn';

type FooterProps = {
  className?: string;
};

function Footer({ className }: FooterProps) {
  return (
    <footer className={cn('footer', className)}>
      <Container>
        <div className="footer__body">footer</div>
      </Container>
    </footer>
  );
}

export default Footer;
