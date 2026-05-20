'use client';

import Link from 'next/link';
import { Heart, MapPin, Star, Home } from 'lucide-react';
import { MontanaCard } from '@/components/cards/MontanaCard';
import { MontanaButton } from '@/components/buttons/MontanaButton';

interface PropertyCardProps {
  id?: string;
  title?: string;
  location?: string;
  price?: string;
  rating?: number;
  favorites?: number;
  imageUrl?: string;
  // Legacy props for backward compatibility
  code?: string;
  type?: string;
  operation?: string;
  address?: string;
  neighborhood?: string;
  status?: string;
}

export const PropertyCard = ({
  id = '1',
  title = 'Casa Alfonso Reyes',
  location = 'San Pedro Garza García',
  price = '$5.2M',
  rating = 5,
  favorites = 12,
  imageUrl,
}: PropertyCardProps) => {
  return (
    <Link href={`/propiedades/${id}`}>
      <MontanaCard className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        {/* Image Placeholder */}
        <div className="relative h-48 bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center overflow-hidden rounded-t-xl">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-amber-400">
              <Home size={56} strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Content */}
        <MontanaCard.Content className="pt-4">
          {/* Header with Title and Favorite Button */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex-1">{title}</h3>
            <button className="ml-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
              <Heart size={20} />
            </button>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs text-gray-600 ml-2">({favorites} favoritos)</span>
          </div>

          {/* Price */}
          <p className="text-2xl font-bold text-gray-900 mb-2">{price}</p>

          {/* Location */}
          <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
            <MapPin size={14} className="text-amber-500 flex-shrink-0" />
            <span>{location}</span>
          </p>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <MontanaButton variant="primary" size="sm">
              Ver más
            </MontanaButton>
            <MontanaButton variant="secondary" size="sm">
              Contactar
            </MontanaButton>
          </div>
        </MontanaCard.Content>
      </MontanaCard>
    </Link>
  );
};
