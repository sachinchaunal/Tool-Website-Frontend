import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
  title, 
  description, 
  keywords = '', 
  canonicalUrl,
  image = '/og-image.jpg', 
  schema = null 
}) => {
  // Environment variable for site URL
  const siteURL = process.env.REACT_APP_SITE_URL || 'https://toolwebsite.vercel.app';
  
  // Default values if not provided
  const siteTitle = 'Tool Website';
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const pageDescription = description || 'Free online tools for PDF, image editing, media compression and more.';
  const pageKeywords = keywords ? keywords : 'online tools, free tools, utility tools';
  const pageUrl = canonicalUrl || window.location.href;
  const fullImageUrl = image.startsWith('http') ? image : `${siteURL}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={fullImageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={pageUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
      <meta property="twitter:image" content={fullImageUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />
      
      {/* JSON-LD Schema if provided */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 