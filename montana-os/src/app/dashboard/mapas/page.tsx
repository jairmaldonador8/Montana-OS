'use client';

import { MontanaCard } from '@/components/cards/MontanaCard';
import { MapPin, DollarSign, Home } from 'lucide-react';

export default function MapasPage() {
  const properties = [
    {
      id: '1',
      name: 'Casa Garza García',
      price: '$2.5M',
      location: 'San Pedro Garza García',
      lat: 25.6866,
      lng: -100.3161,
    },
    {
      id: '2',
      name: 'Departamento Centro',
      price: '$1.2M',
      location: 'Centro, Monterrey',
      lat: 25.6867,
      lng: -100.3165,
    },
    {
      id: '3',
      name: 'Villa San Pedro',
      price: '$4.8M',
      location: 'San Pedro Garza García',
      lat: 25.688,
      lng: -100.317,
    },
    {
      id: '4',
      name: 'Penthouse',
      price: '$3.1M',
      location: 'Santa Catarina',
      lat: 25.68,
      lng: -100.31,
    },
  ];

  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3589.2165852658316!2d-100.31623!3d25.6867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662c4375c5c5c5d%3A0x5c5c5c5c5c5c5c5c!2sMonterrey%2C%20Nuevo%20Le%C3%B3n!5e0!3m2!1ses!2smx!4v1234567890`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mapa de Propiedades</h1>
        <p className="text-gray-600 mt-2">Visualiza todas tus propiedades en el mapa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <MontanaCard>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={mapUrl}
              />
            </div>
          </MontanaCard>
        </div>

        {/* Properties List */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-lg">Propiedades en Mapa</h3>
          {properties.map((prop) => (
            <MontanaCard key={prop.id}>
              <MontanaCard.Content>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Home size={16} className="text-amber-500 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{prop.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <MapPin size={12} />
                        <span>{prop.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-amber-600 text-sm">
                    <DollarSign size={14} />
                    <span>{prop.price}</span>
                  </div>
                </div>
              </MontanaCard.Content>
            </MontanaCard>
          ))}
        </div>
      </div>
    </div>
  );
}
