export function add15MinutestoTime(startTime) {
  const [hour, minute] = startTime.split(":").map(Number);
  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute + 15);

  const newHour = date.getHours().toString().padStart(2, "0");
  const newMinute = date.getMinutes().toString().padStart(2, "0");

  return `${newHour}:${newMinute}`;
}
