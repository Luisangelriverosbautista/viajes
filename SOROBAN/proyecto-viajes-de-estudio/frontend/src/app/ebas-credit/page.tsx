'use client';
export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import PartnerCompanies from '@/components/PartnerCompanies';
import CreditScoringFlow from '@/components/CreditScoringFlow';

/**
 * EBAS Credit Application Page (Protected)
 * Displays partners first, then credit flow when partner is selected
 */
function EBASCreditContent() {
  const searchParams = useSearchParams();
  const selectedPartner = searchParams.get('partner');

  return (
    <AuthGuard>
      {selectedPartner ? (
        <CreditScoringFlow partnerName={selectedPartner} />
      ) : (
        <PartnerCompanies />
      )}
    </AuthGuard>
  );
}

export default function EBASCredit() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-400">Cargando...</p></div>}>
      <EBASCreditContent />
    </Suspense>
  );
}




