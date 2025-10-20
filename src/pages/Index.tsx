
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
    <Helmet>
        <title>Edumall Uganda | Buy Educational Materials, Books & School Supplies Online</title>
        <meta name="description" content="Edumall Uganda is your online educational marketplace for laboratory supplies, school stationery, textbooks and other educational materials." />
        <meta name="keywords" content="edumall, edu, education, ecommerce, textbooks, school supplies, laboratory equipment, Uganda, online marketplace" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://edumallug.com" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Edumall" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Edumall Uganda | Buy Educational Materials Online" />
        <meta property="og:description" content="Edumall Uganda is your online educational marketplace for laboratory supplies, school stationery, textbooks and other educational materials." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://edumallug.com" />
        <meta property="og:image" content="https://i.imghippo.com/files/R3552HkQ.png" />
        <meta property="og:site_name" content="Edumall Uganda" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@edumall" />
        <meta name="twitter:title" content="Edumall Uganda | Buy Educational Materials Online" />
        <meta name="twitter:description" content="Edumall Uganda is your online educational marketplace for textbooks, laboratory supplies, school stationery, and other educational materials." />
        <meta name="twitter:image" content="https://i.imghippo.com/files/R3552HkQ.png" />

        <meta name="google-site-verification" content="GHreIH_Sm0favn5RbGUVkLfvDTv42ZFGQiwld9luuMU" />
      </Helmet>

     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      <main>
        <HeroSection />
        {/* More sections will be added in subsequent phases */}
      </main>
    </div>
    </>
   
  );
};

export default Index;
