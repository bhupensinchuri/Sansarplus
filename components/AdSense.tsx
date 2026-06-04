
import React, { useEffect } from 'react';

interface AdSenseProps {
  client: string;
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: string;
  layoutKey?: string; // For In-feed ads
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSense: React.FC<AdSenseProps> = ({ 
  client, 
  slot, 
  format = 'auto', 
  responsive = 'true',
  layoutKey,
  style = { display: 'block' },
  className
}) => {

  useEffect(() => {
    // Delay push to ensure the element has been painted and has width
    // This fixes "No slot size for availableWidth=0" error
    const timer = setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense push error:', e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []); 

  return (
    <div className={`ad-container ${className || ''}`}>
        <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', ...style }} 
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive}
            data-ad-layout-key={layoutKey}
        ></ins>
    </div>
  );
};

export default AdSense;
