"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Veterinarian } from "@/lib/mongodb";
import {
  ArrowLeft,
  MapPin,
  Star,
  Phone,
  Globe,
  Clock,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { convertHoursTo24h } from "@/lib/timeUtils";
import { generateImageUrl, getImagePlaceholder } from "@/lib/imageUtils";

type OpeningHour = { day: string; hours: string };

export default function VeterinarianDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [veterinarian, setVeterinarian] = useState<Veterinarian | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadVeterinarian(params.id as string);
    }
  }, [params.id]);

  const loadVeterinarian = async (identifier: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/veterinarians/${identifier}`);

      if (!response.ok) {
        throw new Error("Veterinarian not found");
      }

      const data = await response.json();
      setVeterinarian(data.data);
      setError(null);
    } catch (err) {
      setError("Failed to load veterinarian information");
      console.error("Error loading veterinarian:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const formatOpeningHours = (hours: OpeningHour[]) => {
    if (!hours || hours.length === 0) return null;
    const weekdays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return weekdays.map((day) => {
      const item = hours.find((h) => h.day === day);
      const display = item?.hours ? convertHoursTo24h(item.hours) : "Closed";
      return (
        <div
          key={day}
          className="flex justify-between py-2 border-b border-gray-100 last:border-b-0"
        >
          <span className="font-medium text-gray-700">{day}</span>
          <span className="text-gray-600">{display}</span>
        </div>
      );
    });
  };

  const getGoogleMapsUrl = (googleMapsId: string) => {
    return `https://www.google.com/maps/place/?q=place_id:${googleMapsId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading veterinarian information...</p>
        </div>
      </div>
    );
  }

  if (error || !veterinarian) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Veterinarian Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The requested veterinarian does not exist"}
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="relative h-64 md:h-80 w-full mb-6 rounded-lg overflow-hidden bg-gray-200">
              {veterinarian.imageUrl && veterinarian._id ? (
                <Image
                  src={
                    generateImageUrl(veterinarian._id.toString())
                  }
                  alt={veterinarian.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                />
              ) : (
                <div {...getImagePlaceholder("detail")} />
              )}
            </div>

            {/* Title and Rating */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
                  {veterinarian.title}
                </h1>
                <div className="flex items-center">
                  <div className="flex items-center">
                    {renderStars(veterinarian.googleScore)}
                  </div>
                  <span className="ml-2 text-2xl font-bold text-gray-900">
                    {veterinarian.googleScore}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {veterinarian.categoryName}
                </span>
              </div>

              {/* Address */}
              {veterinarian.address && (
                <div className="flex items-start mb-4">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">
                      {veterinarian.address}
                    </p>
                    {veterinarian.neighborhood && (
                      <p className="text-gray-600 text-sm">
                        {veterinarian.neighborhood}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3">
                {veterinarian.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <a
                      href={`tel:${veterinarian.phone}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {veterinarian.phone}
                    </a>
                  </div>
                )}

                {veterinarian.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <a
                      href={veterinarian.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      {veterinarian.website.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Opening Hours */}
            {veterinarian.openingHours &&
              veterinarian.openingHours.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Opening Hours
                  </h2>
                  <div className="space-y-1">
                    {formatOpeningHours(
                      veterinarian.openingHours as unknown as OpeningHour[]
                    )}
                  </div>
                </div>
              )}

            {/* Google Review */}
            {veterinarian.googleReview && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Review from Google Maps
                </h2>
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {renderStars(veterinarian.googleReview.stars)}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(
                      veterinarian.googleReview.publishedAtDate
                    ).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                {veterinarian.googleReview.text && (
                  <p className="text-gray-700 leading-relaxed">
                    &quot;{veterinarian.googleReview.text}&quot;
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a
                  href={`tel:${veterinarian.phone}`}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-center block flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </a>

                <a
                  href={getGoogleMapsUrl(veterinarian.googleMapsId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 text-center block flex items-center justify-center"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Directions
                </a>

                {veterinarian.website && (
                  <a
                    href={veterinarian.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200 text-center block flex items-center justify-center"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Categories */}
            {veterinarian.categories && veterinarian.categories.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Service Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {veterinarian.categories.map((category, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location Info */}
            {/* {veterinarian.location && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Location
                </h3>
                <div className="text-sm text-gray-600">
                  <p>Latitude: {veterinarian.location.coordinates[1].toFixed(6)}</p>
                  <p>Longitude: {veterinarian.location.coordinates[0].toFixed(6)}</p>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </main>
    </div>
  );
}
