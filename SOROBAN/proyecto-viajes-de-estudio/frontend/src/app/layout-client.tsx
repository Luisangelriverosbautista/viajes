'use client';

import { WalletProvider } from "@/contexts/WalletContext";
import { SorobanProvider } from "@/contexts/SorobanContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider>
      <SorobanProvider>
        <div>
          {children}
        </div>
      </SorobanProvider>
    </WalletProvider>
  );
}
