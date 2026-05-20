'use client';

import { NewLeadForm } from '@/components/leads/NewLeadForm';

export default function LeadsPage() {
  const handleLeadSuccess = (leadId: string) => {
    console.log('Lead created with ID:', leadId);
  };

  const handleLeadError = (error: string) => {
    console.error('Lead creation error:', error);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-montana-gold">
          Comunicación
        </p>
        <h1 className="text-4xl font-editorial mt-2">Leads</h1>
        <p className="text-gray-400 mt-2 font-editorial italic">
          Crea nuevos leads y gestiona los interesados en propiedades.
        </p>
      </div>
      <NewLeadForm
        onSuccess={handleLeadSuccess}
        onError={handleLeadError}
      />
    </div>
  );
}
