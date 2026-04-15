import type { DailyMetrics } from '../types';

export function getSleepPoints(sleepHours: number): number {
  if (sleepHours >= 7 && sleepHours <= 9) {
    return 18;
  }
  if (sleepHours >= 5 && sleepHours < 7) {
    return Math.round(4 + ((sleepHours - 5) / 2) * 14);
  }
  if (sleepHours > 9 && sleepHours <= 10) {
    return Math.round(18 - (sleepHours - 9) * 2);
  }
  if (sleepHours > 10) {
    return Math.round(Math.max(6, 16 - (sleepHours - 10) * 2));
  }

  const inverseDrop = Math.log1p((5 - sleepHours) * 2) / Math.log1p(10);
  return -Math.round(8 + inverseDrop * 20);
}

export function getPhonePoints(phoneMinutes: number): number {
  if (phoneMinutes < 30) {
    return 18;
  }
  if (phoneMinutes <= 120) {
    return Math.round(18 - ((phoneMinutes - 30) / 90) * 18);
  }

  const exceededMinutes = phoneMinutes - 120;
  const penalty = 4 * (2 ** (exceededMinutes / 30) - 1);
  return -Math.round(penalty);
}

export function getStudyPoints(studyMinutes: number): number {
  if (studyMinutes === 0) {
    return -30;
  }

  const studyHours = studyMinutes / 60;
  return Math.round(9 * Math.log1p(studyHours * 2));
}

export function getMetricBreakdown(metrics?: DailyMetrics | null): Record<string, number> {
  if (!metrics) {
    return {};
  }

  return {
    sleep: getSleepPoints(metrics.sleep_hours),
    phone: getPhonePoints(metrics.phone_minutes),
    study: getStudyPoints(metrics.study_minutes),
  };
}

export function getSleepFeedback(sleepHours: number): string {
  if (sleepHours < 5) {
    return 'Caída fuerte por debajo del rango reparador.';
  }
  if (sleepHours <= 9) {
    return 'Ventana óptima de recuperación y estabilidad.';
  }
  if (sleepHours <= 10) {
    return 'Todavía útil, pero ya empieza a perder eficiencia.';
  }
  return 'Se activa una reducción suave para evitar letargo.';
}

export function getPhoneFeedback(phoneMinutes: number): string {
  if (phoneMinutes < 30) {
    return 'Zona Plus: control total del impulso digital.';
  }
  if (phoneMinutes <= 120) {
    return 'Zona de transición: cada minuto extra erosiona el score.';
  }
  return 'Zona crítica: la penalización crece de forma exponencial.';
}

export function getStudyFeedback(studyMinutes: number): string {
  if (studyMinutes === 0) {
    return 'Costo de oportunidad máximo: el sistema castiga la inercia.';
  }
  if (studyMinutes < 60) {
    return 'El estudio suma, pero todavía estás lejos del tramo sólido.';
  }
  return 'Sigues sumando, aunque cada hora adicional aporta menos.';
}
