import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Examples from '@/components/Examples';
import Api from '@/components/Api';
import Guide from '@/components/Guide';
import Footer from '@/components/Footer';
import { PrismProvider } from '@/providers/PrismProvider';

function App() {
  return (
    <PrismProvider>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Examples />
        <Api />
        <Guide />
      </main>
      <Footer />
    </PrismProvider>
  );
}

export default App;
