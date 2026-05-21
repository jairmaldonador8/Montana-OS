'use client';

import { useState } from 'react';
// import { MontanaCard } from '@/components/cards/MontanaCard';
import { Send, MessageCircle } from 'lucide-react';

export default function MensajesPage() {
  const [selectedChat, setSelectedChat] = useState('1');
  const [message, setMessage] = useState('');

  const chats = [
    {
      id: '1',
      name: 'Juan García',
      lastMessage: 'Me gustaría agendar una visita',
      timestamp: 'Hace 2 min',
      unread: 2,
    },
    {
      id: '2',
      name: 'María López',
      lastMessage: '¿Cuándo está disponible?',
      timestamp: 'Hace 15 min',
      unread: 0,
    },
    {
      id: '3',
      name: 'Carlos Rodríguez',
      lastMessage: 'Perfecto, gracias',
      timestamp: 'Ayer',
      unread: 0,
    },
  ];

  const messages = {
    '1': [
      { id: '1', sender: 'Juan', text: '¿Hola? ¿Está disponible la propiedad?', timestamp: '10:30 AM' },
      {
        id: '2',
        sender: 'Tú',
        text: 'Hola Juan, claro que sí. Podemos agendar una visita cuando quieras.',
        timestamp: '10:35 AM',
      },
      {
        id: '3',
        sender: 'Juan',
        text: 'Me gustaría agendar una visita',
        timestamp: 'Hace 2 min',
      },
    ],
    '2': [
      {
        id: '1',
        sender: 'María',
        text: 'Buenos días, quería saber el precio de la propiedad',
        timestamp: 'Ayer',
      },
      { id: '2', sender: 'Tú', text: 'El precio es $1.2M, ¿te interesa?', timestamp: 'Ayer' },
      { id: '3', sender: 'María', text: '¿Cuándo está disponible?', timestamp: 'Hace 15 min' },
    ],
    '3': [
      { id: '1', sender: 'Carlos', text: 'Listo, muchas gracias', timestamp: 'Ayer' },
      {
        id: '2',
        sender: 'Tú',
        text: 'De nada, te envío la documentación por email.',
        timestamp: 'Ayer',
      },
      { id: '3', sender: 'Carlos', text: 'Perfecto, gracias', timestamp: 'Ayer' },
    ],
  };

  const currentMessages = messages[selectedChat as keyof typeof messages] || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mensajes</h1>
        <p className="text-gray-600 mt-2">Chatea con tus leads y clientes</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">Sección de mensajes - En construcción</p>
      </div>
    </div>
  );
}
