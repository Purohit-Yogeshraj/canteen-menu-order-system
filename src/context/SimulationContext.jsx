// ==============================================================================
// SIMULATION CONTEXT (DEV & DEMO CONTROLS)
// Operates via virtual offset - NEVER modifies system clock Date.now
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getKolkataTime } from '../utils/formatters';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  // Enabled in dev mode and in lab evaluation deployments unless explicitly disabled
  const isDev = import.meta.env.DEV;
  const isDemoDisabled = import.meta.env.VITE_ENABLE_DEMO_CONTROLS === 'false';
  const isDevOrDemo = !isDemoDisabled;

  // If real-world Indian time is outside canteen operating hours (08:00 AM - 04:45 PM IST),
  // automatically default to 12:30 PM peak lunch hours so evaluators and examiners can test immediately!
  const calculateInitialOffset = () => {
    if (!isDevOrDemo) return { offset: 0, active: false, scenario: 'real' };

    const now = new Date();
    const kolkata = getKolkataTime(now);
    const totalMinutes = kolkata.hour * 60 + kolkata.minute;

    // Canteen is closed if before 8:00 AM (480m) or past 4:45 PM (1005m) IST
    const isClosed = totalMinutes < 480 || totalMinutes >= 1005;

    if (isClosed) {
      // 12:30 PM IST is 12 * 60 + 30 = 750 minutes
      const targetMinutes = 12 * 60 + 30;
      const diffMinutes = targetMinutes - totalMinutes;
      const offsetMs = diffMinutes * 60 * 1000;

      return {
        offset: offsetMs,
        active: true,
        scenario: 'normal',
      };
    }

    return { offset: 0, active: false, scenario: 'real' };
  };

  const initial = calculateInitialOffset();
  const [virtualOffsetMs, setVirtualOffsetMs] = useState(initial.offset);
  const [simulationActive, setSimulationActive] = useState(initial.active);
  const [simulatedScenario, setSimulatedScenario] = useState(initial.scenario);

  // Scenario presets (calculated strictly relative to Asia/Kolkata timezone)
  const setScenario = useCallback((scenario) => {
    if (!isDevOrDemo) return;

    const now = new Date();
    const kolkata = getKolkataTime(now);
    const totalMinutes = kolkata.hour * 60 + kolkata.minute;
    setSimulatedScenario(scenario);

    if (scenario === 'normal') {
      // Set to 12:30 PM IST today (peak hours - open)
      const targetMinutes = 12 * 60 + 30; // 750
      const offsetMs = (targetMinutes - totalMinutes) * 60 * 1000;
      setVirtualOffsetMs(offsetMs);
      setSimulationActive(true);
    } else if (scenario === 'cutoff') {
      // Set to 4:46 PM IST today (16:46 - cutoff active)
      const targetMinutes = 16 * 60 + 46; // 1006
      const offsetMs = (targetMinutes - totalMinutes) * 60 * 1000;
      setVirtualOffsetMs(offsetMs);
      setSimulationActive(true);
    } else if (scenario === 'closed') {
      // Set to 5:30 PM IST today (17:30 - closed)
      const targetMinutes = 17 * 60 + 30; // 1050
      const offsetMs = (targetMinutes - totalMinutes) * 60 * 1000;
      setVirtualOffsetMs(offsetMs);
      setSimulationActive(true);
    } else {
      // Reset to real system clock
      setVirtualOffsetMs(0);
      setSimulationActive(false);
    }
  }, [isDevOrDemo]);

  const getEffectiveTime = useCallback(() => {
    return new Date(Date.now() + virtualOffsetMs);
  }, [virtualOffsetMs]);

  return (
    <SimulationContext.Provider
      value={{
        isDevMode: isDevOrDemo,
        simulationActive,
        simulatedScenario,
        setScenario,
        getEffectiveTime,
        virtualOffsetMs,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    return {
      isDevMode: false,
      simulationActive: false,
      simulatedScenario: 'real',
      setScenario: () => {},
      getEffectiveTime: () => new Date(),
      virtualOffsetMs: 0,
    };
  }
  return context;
}
