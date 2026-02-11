import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategoryGrid from '@/components/CategoryGrid';
import FeaturedLabs from '@/components/FeaturedLabs';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <CategoryGrid />
        <FeaturedLabs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
