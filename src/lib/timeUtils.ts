export function getBerlinTodayName(): string {
  const berlinNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
  const dayIndex = berlinNow.getDay(); // 0 Sunday ... 6 Saturday
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return dayNames[dayIndex];
}

function sanitize(str: string): string {
  // Remove non-breaking/narrow spaces and trim
  return str.replace(/[\u00A0\u202F]/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseTime12hToMinutes(part: string, fallbackMeridiem?: 'AM' | 'PM'): number | null {
  const s = sanitize(part);
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = (m[3] || fallbackMeridiem || '').toUpperCase();
  if (hour === 12) hour = 0; // normalize 12AM -> 0, 12PM handled by adding 12 later
  let total = hour * 60 + minute;
  if (meridiem === 'PM') total += 12 * 60;
  // If still no meridiem, assume as-is (already minutes from 0..720). Caller can adjust.
  return total;
}

export function convertHoursTo24h(range: string): string {
  const text = sanitize(range);
  if (!text) return '';
  if (/Open 24 hours/i.test(text)) return 'Open 24 hours';
  if (/Closed/i.test(text)) return 'Closed';

  // Match patterns like "9 AM to 3 PM", "10:30 AM to 8 PM", "12 to 3 PM"
  const m = text.match(/([0-9]{1,2}(?::[0-9]{2})?\s*(?:AM|PM)?)[\s]*to[\s]*([0-9]{1,2}(?::[0-9]{2})?\s*(?:AM|PM))/i);
  if (!m) return text; // fallback to original if unknown format

  const startStr = sanitize(m[1]);
  const endStr = sanitize(m[2]);

  // If start missing AM/PM, infer from end's AM/PM
  const endMeridiem = (endStr.match(/(AM|PM)/i)?.[1] || '').toUpperCase() as 'AM' | 'PM' | '';
  const startMin = parseTime12hToMinutes(startStr, endMeridiem as 'AM' | 'PM' | undefined);
  const endMin = parseTime12hToMinutes(endStr);
  if (startMin == null || endMin == null) return text;

  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m2 = mins % 60;
    const hh = h.toString().padStart(2, '0');
    const mm = m2.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  };

  // Handle overnight (end < start)
  if (endMin < startMin) {
    return `${fmt(startMin)}–${fmt(endMin)} (next day)`;
  }

  return `${fmt(startMin)}–${fmt(endMin)}`;
}
