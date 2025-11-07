/**
 * ProcessingStatus - Componente para mostrar el estado del procesamiento de modelo 3D
 * Con polling automático para actualizar el progreso
 */
'use client'

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Upload, Cpu } from 'lucide-react';

const ProcessingStatus = ({
  status,
  progress = 0,
  errorMessage = null,
  onStatusUpdate = null
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Animar el progreso
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getStatusConfig = () => {
    switch (status) {
      case 'uploading':
        return {
          icon: Upload,
          title: 'Subiendo imágenes...',
          description: 'Estamos recibiendo tus fotografías',
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          progressColor: 'bg-blue-500',
        };
      case 'processing':
        return {
          icon: Cpu,
          title: 'Generando modelo 3D...',
          description: 'Nuestro sistema está procesando las imágenes con fotogrametría',
          color: 'purple',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800',
          iconColor: 'text-purple-600',
          progressColor: 'bg-purple-500',
        };
      case 'completed':
        return {
          icon: CheckCircle,
          title: '¡Modelo 3D generado!',
          description: 'Tu escultura está lista para visualizarse en realidad aumentada',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          progressColor: 'bg-green-500',
        };
      case 'failed':
        return {
          icon: XCircle,
          title: 'Error en el procesamiento',
          description: errorMessage || 'Hubo un problema al generar el modelo 3D',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          progressColor: 'bg-red-500',
        };
      default:
        return {
          icon: Loader2,
          title: 'Preparando...',
          description: 'Iniciando proceso',
          color: 'gray',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-800',
          iconColor: 'text-slate-600',
          progressColor: 'bg-slate-500',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const isProcessing = status === 'uploading' || status === 'processing';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-6`}>
      <div className="flex items-start gap-4">
        {/* Icono */}
        <div className="flex-shrink-0">
          <Icon
            className={`h-8 w-8 ${config.iconColor} ${isProcessing ? 'animate-pulse' : ''}`}
          />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${config.textColor} mb-1`}>
            {config.title}
          </h3>
          <p className={`text-sm ${config.textColor} opacity-90 mb-4`}>
            {config.description}
          </p>

          {/* Barra de progreso */}
          {!isFailed && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={config.textColor}>Progreso</span>
                <span className={`font-semibold ${config.textColor}`}>
                  {Math.round(displayProgress)}%
                </span>
              </div>
              <div className="w-full bg-white bg-opacity-50 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 ${config.progressColor} rounded-full transition-all duration-500 ease-out ${
                    isProcessing ? 'animate-pulse' : ''
                  }`}
                  style={{ width: `${displayProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Estados del proceso */}
          <div className="mt-4 space-y-2">
            <ProcessStep
              label="Imágenes recibidas"
              completed={progress >= 0}
              active={status === 'uploading'}
            />
            <ProcessStep
              label="Análisis de fotogrametría"
              completed={progress > 30}
              active={status === 'processing' && progress <= 30}
            />
            <ProcessStep
              label="Generación de malla 3D"
              completed={progress > 70}
              active={status === 'processing' && progress > 30 && progress <= 70}
            />
            <ProcessStep
              label="Optimización de modelo"
              completed={progress > 90}
              active={status === 'processing' && progress > 70 && progress <= 90}
            />
            <ProcessStep
              label="Modelo 3D listo"
              completed={isCompleted}
              active={status === 'processing' && progress > 90}
            />
          </div>

          {/* Mensaje de error detallado */}
          {isFailed && errorMessage && (
            <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Detalles del error:</strong> {errorMessage}
              </p>
            </div>
          )}

          {/* Tiempo estimado */}
          {isProcessing && (
            <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
              <p className="text-xs text-slate-600">
                ⏱ <strong>Tiempo estimado:</strong> {getEstimatedTime(progress)} minutos
              </p>
              <p className="text-xs text-slate-600 mt-1">
                💡 Puedes cerrar esta página. Te notificaremos cuando esté listo.
              </p>
            </div>
          )}

          {/* Mensaje de completado */}
          {isCompleted && (
            <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
              <p className="text-sm text-green-700">
                🎉 ¡Tu modelo 3D está listo! Ahora puedes visualizarlo en realidad aumentada
                desde tu dispositivo móvil.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para mostrar los pasos del proceso
const ProcessStep = ({ label, completed, active }) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          completed
            ? 'bg-green-500 border-green-500'
            : active
            ? 'border-purple-500 bg-purple-100'
            : 'border-slate-300 bg-white'
        }`}
      >
        {completed && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        )}
        {active && !completed && (
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        )}
      </div>
      <span
        className={`${
          completed
            ? 'text-green-700 font-medium'
            : active
            ? 'text-purple-700 font-medium'
            : 'text-slate-500'
        }`}
      >
        {label}
      </span>
      {active && !completed && (
        <Loader2 className="w-4 h-4 text-purple-600 animate-spin ml-auto" />
      )}
    </div>
  );
};

// Función auxiliar para estimar el tiempo restante
const getEstimatedTime = (progress) => {
  if (progress < 10) return '10-15';
  if (progress < 30) return '8-12';
  if (progress < 50) return '5-8';
  if (progress < 70) return '3-5';
  if (progress < 90) return '2-3';
  return '1-2';
};

export default ProcessingStatus;
