"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Partner {
  id: string;
  name: string;
  logo: string;
  sector: string;
  description: string;
  support: string;
  mission: string;
  benefits: string[];
  color: string;
}

const partners: Partner[] = [
  {
    id: "banco-horizon",
    name: "Banco Horizonte",
    logo: "🏦",
    sector: "Instituciones Financieras",
    description: "Líder en créditos educativos con más de 15 años de experiencia",
    support: "Proporciona financiamiento sin aval para viajes de estudio a través de nuestra plataforma blockchain",
    mission: "Democratizar el acceso a experiencias educativas internacionales para estudiantes mexicanos",
    benefits: [
      "Tasas de interés competitivas desde 4.5% anual",
      "Plazo de hasta 24 meses para pagar",
      "Aprobación en 24 horas",
      "Sin comisiones ocultas",
    ],
    color: "from-blue-600 to-cyan-500",
  },
  {
    id: "fundacion-educativa",
    name: "Fundación Educativa México",
    logo: "📚",
    sector: "Organizaciones Educativas",
    description: "Organización sin fines de lucro dedicada a ampliar oportunidades educativas",
    support: "Contribuye con becas parciales y programas de mentoría para estudiantes de bajo recurso",
    mission: "Asegurar que ningún estudiante se quede sin vivir una experiencia educativa transformadora",
    benefits: [
      "Becas de hasta 30% del costo del viaje",
      "Mentoría académica durante el viaje",
      "Red de más de 500 instituciones aliadas",
      "Seguimiento post-viaje y oportunidades laborales",
    ],
    color: "from-emerald-600 to-teal-500",
  },
  {
    id: "grupo-viajes-edu",
    name: "Grupo Viajes Educativos",
    logo: "✈️",
    sector: "Operadores Turísticos",
    description: "Especialistas en organización de viajes de estudio con estándares internacionales",
    support: "Ofrece paquetes con descuentos especiales y flexibilidad en fechas de pago",
    mission: "Crear experiencias educativas seguras, inclusivas y transformadoras",
    benefits: [
      "Descuentos del 15-20% en paquetes de viaje",
      "Flexibilidad en fechas de salida",
      "Seguros de viaje incluidos",
      "Coordinadores bilingües en destino",
    ],
    color: "from-purple-600 to-pink-500",
  },
  {
    id: "tech-learning",
    name: "TechLearning Global",
    logo: "💻",
    sector: "EdTech",
    description: "Plataforma de aprendizaje que integra tecnología blockchain en educación",
    support: "Proporciona acceso a plataforma de gestión de créditos transparente y verificable",
    mission: "Innovar en la forma en que se financian y se documentan las experiencias educativas",
    benefits: [
      "Créditos digitales verificables en blockchain",
      "Certificados digitales de participación",
      "Acceso a comunidad global de estudiantes",
      "Oportunidades de networking internacional",
    ],
    color: "from-orange-600 to-red-500",
  },
];

export default function PartnerCompanies() {
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const selected = partners.find((p) => p.id === selectedPartner);

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Fondo con gradiente y patrón */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4">
            Nuestros Aliados Financieros
          </h1>
          <p className="text-lg text-slate-300 text-center max-w-3xl mx-auto">
            Organizaciones comprometidas con tu acceso a experiencias educativas internacionales.
            Juntos, hacemos posible tu viaje.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <button
                key={partner.id}
                onClick={() => setSelectedPartner(partner.id)}
                className={`p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 text-left group cursor-pointer ${
                  selectedPartner === partner.id
                    ? "ring-2 ring-white shadow-2xl"
                    : "hover:shadow-lg"
                }`}
                style={{
                  background:
                    selectedPartner === partner.id
                      ? "rgba(255, 255, 255, 0.15)"
                      : "rgba(255, 255, 255, 0.05)",
                }}
              >
                <div className="text-5xl mb-3">{partner.logo}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition">
                  {partner.name}
                </h3>
                <p className="text-sm text-slate-300 mb-2">{partner.sector}</p>
                <p className="text-xs text-slate-400">{partner.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12 animate-fadeIn">
            <div className={`bg-gradient-to-br ${selected.color} rounded-3xl p-8 md:p-12 text-white shadow-2xl`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left side */}
                <div>
                  <div className="text-7xl mb-6">{selected.logo}</div>
                  <h2 className="text-4xl font-extrabold mb-4">{selected.name}</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2 opacity-90">¿Por qué nos apoyan?</h3>
                      <p className="text-base leading-relaxed opacity-90">{selected.mission}</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-2 opacity-90">Cómo nos apoya</h3>
                      <p className="text-base leading-relaxed opacity-90">{selected.support}</p>
                    </div>
                  </div>
                </div>

                {/* Right side - Benefits */}
                <div>
                  <h3 className="text-2xl font-bold mb-6 opacity-90">Beneficios para ti</h3>
                  <ul className="space-y-4">
                    {selected.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-white opacity-70 flex-shrink-0" />
                        <span className="text-base opacity-90">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="mt-8 pt-8 border-t border-white/20">
                    <Link
                      href={`/ebas-credit?partner=${selected.id}`}
                      className="inline-block px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      Solicitar Financiamiento con {selected.name}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!selected && (
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12 text-center">
            <p className="text-xl text-slate-300">
              ✨ Selecciona un aliado para conocer sus beneficios y solicitar financiamiento
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 text-center">
          <div className="glass rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Necesitas más información?
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Nuestro equipo de asesores está disponible para ayudarte a elegir la opción de financiamiento
              que mejor se adapte a tu situación.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Contactar Asesor
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
