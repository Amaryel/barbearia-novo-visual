import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Services from "./sections/Services";
import Gallery from "./sections/Gallery";
import Booking from "./sections/Booking";
import Location from "./sections/Location";
import ChatWidget from "./components/ChatWidget";
import { useSmoothScroll } from "./utils/smoothScroll";

export default function App() {
  useSmoothScroll();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Booking />
        <Location />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
