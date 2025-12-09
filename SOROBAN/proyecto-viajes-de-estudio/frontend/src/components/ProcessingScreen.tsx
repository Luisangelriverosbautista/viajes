"use client";

import React, { useEffect, useState } from "react";

interface ProcessingScreenProps {
  packageName: string;
  companyName: string;
  onComplete: () => void;
}

export default function ProcessingScreen({
  packageName,
  companyName,
  onComplete,
}: ProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    "Validando información personal...",
    "Evaluando elegibilidad...",
    "Procesando solicitud con la empresa...",
    "Generando contrato inteligente...",
    "Registrando en blockchain...",
    "¡Aprobado!",
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < steps.length - 1) {
        setStep(step + 1);
        setProgress((step + 1) * (100 / steps.length));
      } else {
        setProgress(100);
        setTimeout(() => onComplete(), 1500);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [step, steps.length, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Icon Animation */}
        <div className="mb-8">
          <div className="inline-block">
            {step < steps.length - 1 ? (
              <div className="w-24 h-24 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-spin" />
                <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                  <span className="text-4xl">⏳</span>
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-5xl">✓</span>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-2">
          {step < steps.length - 1 ? "Procesando tu solicitud" : "¡Solicitud Aprobada!"}
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-slate-300 mb-8">
          Paquete: <span className="font-bold text-blue-300">{packageName}</span>
          <br />
          Financiador:{" "}
          <span className="font-bold text-emerald-300">{companyName}</span>
        </p>

        {/* Current Step */}
        <div className="mb-8 h-12 flex items-center justify-center">
          <p className="text-xl text-slate-200">
            {steps[step]}
            <span className="inline-block animate-pulse">
              {step < steps.length - 1 ? "..." : ""}
            </span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">{Math.round(progress)}%</p>
        </div>

        {/* Steps Indicator */}
        <div className="flex gap-2 justify-center mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx <= step
                  ? "bg-blue-500 w-3"
                  : "bg-slate-600 w-2"
              }`}
            />
          ))}
        </div>

        {/* Info Text */}
        <p className="text-sm text-slate-400">
          {step < steps.length - 1
            ? "Por favor no cierres esta ventana..."
            : "Redirigiendo en unos segundos..."}
        </p>
      </div>
    </div>
  );
}
