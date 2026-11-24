// ==============================================================================
// CANTEEN OPERATIONAL HOURS HOOK (ASIA/KOLKATA TIMEZONE STRICT)
// Enforces 08:00 - 17:00 IST hours with strict 16:45 IST ordering cutoff
// ==============================================================================

import { useState, useEffect } from 'react';
import { CANTEEN_RULES } from '../utils/constants';
import { useSimulation } from '../context/SimulationContext';
import { getKolkataTime } from '../utils/formatters';

export function useCanteenHours() {
  const { getEffectiveTime } = useSimulation();
  const [status, setStatus] = useState(() => evaluateHours(getEffectiveTime()));

  function evaluateHours(effectiveDate) {
    const kolkata = getKolkataTime(effectiveDate);
    const hours = kolkata.hour;
    const minutes = kolkata.minute;
    const currentTimeMinutes = hours * 60 + minutes;

    const openTimeMinutes = CANTEEN_RULES.OPEN_HOUR * 60 + CANTEEN_RULES.OPEN_MINUTE; // 480 (8:00 AM)
    const cutoffTimeMinutes = CANTEEN_RULES.CUTOFF_HOUR * 60 + CANTEEN_RULES.CUTOFF_MINUTE; // 1005 (4:45 PM)
    const closeTimeMinutes = CANTEEN_RULES.CLOSE_HOUR * 60 + CANTEEN_RULES.CLOSE_MINUTE; // 1020 (5:00 PM)

    const isOpen = currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes;
    const isPastCutoff = currentTimeMinutes >= cutoffTimeMinutes;
    const canAcceptOrders = isOpen && !isPastCutoff;

    let notice = '';
    if (currentTimeMinutes < openTimeMinutes) {
      notice = 'Canteen opens at 8:00 AM IST. Ordering will open shortly.';
    } else if (isPastCutoff && currentTimeMinutes < closeTimeMinutes) {
      notice = 'Orders for today are closed (Cutoff 4:45 PM IST). Canteen closes at 5:00 PM IST.';
    } else if (currentTimeMinutes >= closeTimeMinutes) {
      notice = 'Canteen is closed for today. Kitchen resumes tomorrow at 8:00 AM IST.';
    }

    return {
      isOpen,
      isPastCutoff,
      canAcceptOrders,
      notice,
      currentTime: effectiveDate,
      kolkataTime: kolkata,
      formattedTime: `${kolkata.formatted} IST`,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(evaluateHours(getEffectiveTime()));
    }, 5000);

    // Initial check
    setStatus(evaluateHours(getEffectiveTime()));

    return () => clearInterval(timer);
  }, [getEffectiveTime]);

  return status;
}
