// ==============================================================================
// CURRENCY, TIME & QUEUE FORMATTERS (WITH STRICT ASIA/KOLKATA TIMEZONE)
// ==============================================================================

/**
 * Extract time parts strictly in Asia/Kolkata timezone
 * @param {Date} [date]
 * @returns {{ year: number, month: number, day: number, hour: number, minute: number, second: number, dateStr: string, formatted: string }}
 */
export function getKolkataTime(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const parts = formatter.formatToParts(date);
    const map = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }

    const hour24 = parseInt(map.hour, 10);
    const minute = parseInt(map.minute, 10);
    const second = parseInt(map.second, 10);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const formatted = `${String(hour12).padStart(2, '0')}:${map.minute} ${ampm}`;

    return {
      year: parseInt(map.year, 10),
      month: parseInt(map.month, 10),
      day: parseInt(map.day, 10),
      hour: hour24,
      minute,
      second,
      dateStr: `${map.year}-${map.month}-${map.day}`,
      formatted,
    };
  } catch (e) {
    // Fallback if environment lacks Intl timezone support
    const d = new Date(date);
    const hour24 = d.getHours();
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: hour24,
      minute: d.getMinutes(),
      second: d.getSeconds(),
      dateStr: d.toISOString().slice(0, 10),
      formatted: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

/**
 * Format numeric amount into strict Indian Rupee format (₹)
 * @param {number} amount
 * @returns {string} e.g. "₹60" or "₹60.50"
 */
export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
}

/**
 * Calculate dynamic estimated wait time in minutes
 * Formula: (Active orders ahead in Placed or Preparing + 1) * 5 minutes
 * @param {number} ordersAhead
 * @param {string} currentStatus
 * @returns {number} Wait time in minutes
 */
export function calculateWaitTime(ordersAhead = 0, currentStatus = 'placed') {
  if (currentStatus === 'ready' || currentStatus === 'collected') {
    return 0;
  }
  const count = Math.max(0, Number(ordersAhead) || 0);
  return Math.max(5, (count + 1) * 5);
}

/**
 * Format elapsed time since an order was placed (e.g., "4m ago", "16m ago")
 * @param {string|Date} timestamp
 * @param {Date} [currentTime]
 * @returns {{ text: string, isOverdue: boolean, minutesElapsed: number }}
 */
export function getElapsedTime(timestamp, currentTime = new Date()) {
  if (!timestamp) return { text: 'Just now', isOverdue: false, minutesElapsed: 0 };
  
  const created = new Date(timestamp);
  const now = new Date(currentTime);
  const diffMs = Math.max(0, now.getTime() - created.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);

  let text = 'Just now';
  if (diffMinutes >= 1) {
    text = `${diffMinutes}m ago`;
  }

  return {
    text,
    isOverdue: diffMinutes >= 15,
    minutesElapsed: diffMinutes,
  };
}

/**
 * Pad a token number to 3 digits (e.g. 42 -> "#042")
 * @param {number|string} tokenNumber
 * @returns {string}
 */
export function formatTokenDisplay(tokenNumber) {
  if (!tokenNumber) return '#000';
  const num = parseInt(String(tokenNumber).replace('#', ''), 10);
  if (isNaN(num)) return String(tokenNumber);
  return `#${String(num).padStart(3, '0')}`;
}
