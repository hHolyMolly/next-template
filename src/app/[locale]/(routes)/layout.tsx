import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

type RoutesLayoutProps = {
  children: React.ReactNode;
};

function RoutesLayout({ children }: RoutesLayoutProps) {
  return (
    <div className="wrapper">
      <Header />
      <main id="main-content" className="page">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default RoutesLayout;
