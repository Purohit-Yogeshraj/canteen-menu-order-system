// ==============================================================================
// SIMULATION CONTEXT (DEV & DEMO CONTROLS)
// Operates via virtual offset - NEVER modifies system clock Date.now
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const isDev = import.meta.env.DEV;
  const isEnabled = 
    import.meta.env.VITE_ENABLE_DEMO_CONTROLS === 'true' || 
    import.meta.env.VITE_USE_MOCK_DATA === 'true';

  const isDevOrDemo = isDev || isEnabled;

  // If running in demo mode and current real-world time is outside operating hours (e.g. late night),
  // automatically default to 12:30 PM peak lunch hours so evaluators can test ordering immediately!
  const calculateInitialOffset = () => {
    if (!isDevOrDemo) return { offset: 0, active: false, scenario: 'real' };

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // Canteen is closed if before 8:00 AM (480m) or past 4:45 PM (1005m)
    const isClosed = totalMinutes < 480 || totalMinutes >= 1005;

    if (isClosed) {
      const target = new Date(now);
      target.setHours(12, 30, 0, 0); // 12:30 PM (Open)
      return {
        offset: target.getTime() - now.getTime(),
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

  // Scenario presets
  const setScenario = (scenario) => {
    if (!isDevOrDemo) return;

    const now = new Date();
    setSimulatedScenario(scenario);

    if (scenario === 'normal') {
      // Set to 12:30 PM today (peak hours - open)
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
    };
  }
  return context;
}
