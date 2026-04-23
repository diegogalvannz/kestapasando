import "@/styles/globals.css";
import { Analytics } from '@vercel/analytics/react';
import NewsletterPopup from '../components/NewsletterPopup';

export default function App({ Component, pageProps }) {
  // Don't show popup on dashboard
  const isDashboard = typeof window !== 'undefined' && window.location.pathname === '/dashboard';
  return (
    <>
      <Component {...pageProps} />
      {!isDashboard && <NewsletterPopup />}
      <Analytics />
    </>
  );
}
