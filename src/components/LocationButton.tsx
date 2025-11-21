'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface LocationButtonProps {
  onLocationFound: (coords: { lat: number; lng: number }) => void;
  onError: (error: string) => void;
}

export default function LocationButton({ onLocationFound, onError }: LocationButtonProps) {
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      onError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationFound({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please allow access in browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        onError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return (
    <button
      onClick={getCurrentLocation}
      disabled={loading}
      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {loading ? (
        <LoadingSpinner size="sm" color="white" className="mr-2" />
      ) : (
        <MapPin className="w-4 h-4 mr-2" />
      )}
      {loading ? 'Detecting...' : 'Find Nearby'}
    </button>
  );
}
