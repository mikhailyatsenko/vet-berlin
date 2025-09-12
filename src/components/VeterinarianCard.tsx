import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Phone, Globe, Clock } from 'lucide-react';
import { Veterinarian } from '@/lib/mongodb';
import { getBerlinTodayName, convertHoursTo24h } from '@/lib/timeUtils';

type OpeningHour = { day: string; hours: string };

interface VeterinarianCardProps {
  veterinarian: Veterinarian;
}

export default function VeterinarianCard({ veterinarian }: VeterinarianCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatOpeningHours = (hours: OpeningHour[]) => {
    if (!hours || hours.length === 0) return 'Hours not specified';
    const today = getBerlinTodayName();
    const todayHours = hours.find(h => h.day === today);
    if (!todayHours || !todayHours.hours) return 'Hours not specified';
    return convertHoursTo24h(todayHours.hours);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-200">
        {veterinarian.imageUrl ? (
          <Image
            src={veterinarian.imageUrl}
            alt={veterinarian.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🐾</div>
              <div className="text-sm">No Image</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Rating */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {veterinarian.title}
          </h3>
          <div className="flex items-center ml-2">
            <div className="flex items-center">
              {renderStars(veterinarian.googleScore)}
            </div>
            <span className="ml-1 text-sm font-medium text-gray-600">
              {veterinarian.googleScore}
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="mb-3">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {veterinarian.categoryName}
          </span>
        </div>

        {/* Address */}
        {veterinarian.address && (
          <div className="flex items-start mb-3">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-2">
              {veterinarian.address}
            </p>
          </div>
        )}

        {/* Neighborhood */}
        {veterinarian.neighborhood && (
          <div className="mb-3">
            <span className="text-sm text-gray-500">
              {veterinarian.neighborhood}
            </span>
          </div>
        )}

        {/* Opening Hours */}
        <div className="flex items-center mb-4">
          <Clock className="w-4 h-4 text-gray-400 mr-2" />
          <p className="text-sm text-gray-600">
            {formatOpeningHours(veterinarian.openingHours as unknown as OpeningHour[])}
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {veterinarian.phone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-400 mr-2" />
              <a
                href={`tel:${veterinarian.phone}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {veterinarian.phone}
              </a>
            </div>
          )}
          
          {veterinarian.website && (
            <div className="flex items-center">
              <Globe className="w-4 h-4 text-gray-400 mr-2" />
              <a
                href={veterinarian.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 truncate"
              >
                {veterinarian.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Google Review Preview */}
        {veterinarian.googleReview && (
          <div className="border-t pt-3">
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {renderStars(veterinarian.googleReview.stars)}
              </div>
              <span className="ml-2 text-xs text-gray-500">
                Google Review
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              &quot;{veterinarian.googleReview.text}&quot;
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          <Link
            href={`/veterinarian/${veterinarian.googleMapsId}`}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-center block"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}