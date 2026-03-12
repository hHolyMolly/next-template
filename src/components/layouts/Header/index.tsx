import Container from '@/components/layouts/Container';
import { cn } from '@/lib/cn';

type HeaderProps = {
  className?: string;
};

function Header({ className }: HeaderProps) {
  return (
    <header className={cn('header', className)}>
      <div className="header__wrapper">
        <Container>
          <div className="header__body">header</div>
        </Container>
      </div>
    </header>
  );
}

export default Header;
