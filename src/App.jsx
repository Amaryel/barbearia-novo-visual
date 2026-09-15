import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Services from "./sections/Services";
import Gallery from "./sections/Gallery";
import Booking from "./sections/Booking";
import Location from "./sections/Location";
import ChatWidget from "./components/ChatWidget";
import BookingModal from "./components/BookingModal";
import AdminApp from "./admin/AdminApp";
import { useSmoothScroll } from "./utils/smoothScroll";

export default function App() {
  useSmoothScroll();

  const [isAdminView, setIsAdminView] = useState(() => {
    return (
      window.location.pathname.startsWith("/admin") ||
      window.location.hash === "#admin"
    );
  });

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [initialServiceId, setInitialServiceId] = useState("");

  useEffect(() => {
    function handleLocationChange() {
      if (
        window.location.pathname.startsWith("/admin") ||
        window.location.hash === "#admin"
      ) {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
      }
    }

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  function handleOpenAdmin() {
    setIsAdminView(true);
    window.history.pushState(null, "", "/admin");
  }

  function handleBackToSite() {
    setIsAdminView(false);
    window.history.pushState(null, "", "/");
  }

  function handleOpenBookingModal(serviceId = "") {
    setInitialServiceId(serviceId);
    setIsBookingModalOpen(true);
  }

  function handleCloseBookingModal() {
    setIsBookingModalOpen(false);
    setInitialServiceId("");
  }

  if (isAdminView) {
    return <AdminApp onBackToSite={handleBackToSite} />;
  }

  return (
    <>
      <Header
        onOpenBookingModal={() => handleOpenBookingModal("")}
        onOpenAdmin={handleOpenAdmin}
      />
      <main>
        <Hero onOpenBookingModal={() => handleOpenBookingModal("")} />
        <About />
        <Services onSelectService={(sId) => handleOpenBookingModal(sId)} />
        <Gallery />
        <Booking />
        <Location />
      </main>
      <Footer onOpenAdmin={handleOpenAdmin} />
      <ChatWidget />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        initialServiceId={initialServiceId}
      />
    </>
  );
}
