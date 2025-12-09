'use client';

import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import TravelPackages, { TravelPackage } from './TravelPackages';
import ProcessingScreen from './ProcessingScreen';
import CompletionScreen from './CompletionScreen';
import PartnerCompanies from './PartnerCompanies';
import { SessionManager } from '@/lib/session';

type FlowStep = 'landing' | 'packages' | 'processing' | 'completion' | 'partners';

interface CreditScoringFlowProps {
  partnerName?: string;
}

const CreditScoringFlow: React.FC<CreditScoringFlowProps> = ({ partnerName }) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>(partnerName ? 'landing' : 'partners');
  const [selectedPartner, setSelectedPartner] = useState<string>(partnerName || '');
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  useEffect(() => {
    // Get wallet address from authenticated session
    const address = SessionManager.getWalletAddress();
    if (address) {
      setUserAddress(address);
      console.log('✅ Using authenticated wallet:', address);
    } else {
      console.warn('⚠️ No authenticated wallet found, using fallback');
      setUserAddress('GDJYLRW4DZK7LVGCNAKBO42FGWVDRP2G7BEAXWWUC5E63ZENZ3RAPAKL');
    }
  }, []);

  const handleSelectPartner = (partnerId: string) => {
    setSelectedPartner(partnerId);
    setCurrentStep('landing');
  };

  const handleStartSession = () => {
    setCurrentStep('packages');
  };

  const handleSelectPackage = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setCurrentStep('processing');
  };

  const handleProcessingComplete = () => {
    setCurrentStep('completion');
  };

  const handleBackToPartners = () => {
    setCurrentStep('partners');
  };

  const handleBackToPackages = () => {
    setCurrentStep('packages');
  };

  const handleStartOver = () => {
    setCurrentStep('partners');
    setSelectedPartner('');
    setSelectedPackage(null);
  };

  return (
    <div className="min-h-screen">
      {currentStep === 'partners' && (
        <PartnerCompanies />
      )}
      
      {currentStep === 'landing' && selectedPartner && (
        <LandingPage onStartSession={handleStartSession} partnerName={selectedPartner} />
      )}
      
      {currentStep === 'packages' && (
        <TravelPackages
          onSelectPackage={handleSelectPackage}
          onBack={handleBackToPartners}
        />
      )}
      
      {currentStep === 'processing' && selectedPackage && (
        <ProcessingScreen
          packageName={selectedPackage.name}
          companyName={selectedPartner}
          onComplete={handleProcessingComplete}
        />
      )}
      
      {currentStep === 'completion' && selectedPackage && (
        <CompletionScreen
          packageName={selectedPackage.name}
          companyName={selectedPartner}
          totalCost={selectedPackage.price}
          monthlyPayment={selectedPackage.monthlyPayment}
          loanTerm={selectedPackage.loanTerm}
          userAddress={userAddress}
        />
      )}
    </div>
  );
};

export default CreditScoringFlow;