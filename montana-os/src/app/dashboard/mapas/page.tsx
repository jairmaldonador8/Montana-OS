'use client';

// import { MontanaCard } from '@/components/cards/MontanaCard';
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

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">Sección de mapas - En construcción</p>
      </div>
    </div>
  );
}
