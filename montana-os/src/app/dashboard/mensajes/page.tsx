'use client';

import { useState } from 'react';
import { MontanaCard } from '@/components/cards/MontanaCard';
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <MontanaCard className="h-full overflow-y-auto">
            <MontanaCard.Content>
              <h3 className="font-bold text-gray-900 mb-4">Conversaciones</h3>
              <div className="space-y-2">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedChat === chat.id
                        ? 'bg-amber-50 border-l-4 border-amber-400'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-gray-900 text-sm">{chat.name}</p>
                      {chat.unread > 0 && (
                        <span className="bg-amber-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{chat.lastMessage}</p>
                    <p className="text-xs text-gray-500 mt-1">{chat.timestamp}</p>
                  </button>
                ))}
              </div>
            </MontanaCard.Content>
          </MontanaCard>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2 flex flex-col">
          <MontanaCard className="flex-1 flex flex-col overflow-hidden">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'Tú' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'Tú'
                        ? 'bg-amber-400 text-gray-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none"
                />
                <button className="p-2 bg-amber-400 text-gray-900 rounded-lg hover:bg-amber-500 transition">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </MontanaCard>
        </div>
      </div>
    </div>
  );
}
