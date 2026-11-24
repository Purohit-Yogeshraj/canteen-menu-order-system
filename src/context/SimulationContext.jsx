// ==============================================================================
// SIMULATION CONTEXT (DEV-ONLY)
// Operates via virtual offset - NEVER modifies system clock Date.now
// Disabled by default in production
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const isDev = import.meta.env.DEV;
  const isEnabled = import.meta.env.VITE_ENABLE_DEMO_CONTROLS === 'true';

  // virtualTimeOffset in milliseconds
  const [virtualOffsetMs, setVirtualOffsetMs] = useState(0);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulatedScenario, setSimulatedScenario] = useState('normal'); // 'normal' | 'cutoff' | 'closed'

  // Scenario presets
  const setScenario = (scenario) => {
    if (!isDev && !isEnabled) return;

    const now = new Date();
    setSimulatedScenario(scenario);

    if (scenario === 'normal') {
      // Set to 12:30 PM today (peak hours)
      const target = new Date(now);
      target.setHours(12, 30, 0, 0);
      setVirtualOffsetMs(target.getTime() - now.getTime());
      setSimulationActive(true);
    } else if (scenario === 'cutoff') {
      // Set to 4:46 PM today (16:46 - cutoff active)
      const target = new Date(now);
      target.setHours(16, 46, 0, 0);
      setVirtualOffsetMs(target.getTime() - now.getTime());
      setSimulationActive(true);
    } else if (scenario === 'closed') {
      // Set to 5:30 PM today (17:30 - closed)
      const target = new Date(now);
      target.setHours(17, 30, 0, 0);
      setVirtualOffsetMs(target.getTime() - now.getTime());
      setSimulationActive(true);
    } else {
      // Reset to real system clock
      setVirtualOffsetMs(0);
      setSimulationActive(false);
    }
  };

  const getEffectiveTime = () => {
    return new Date(Date.now() + virtualOffsetMs);
  };

  return (
    <SimulationContext.Provider
      value={{
        isDevMode: isDev || isEnabled,
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
    };
  }
  return context;
}
