function bigNumberFormatter(value: number | string): string {
  //values are too big, return K B M etc
  let val = typeof value === "number" ? value : parseInt(value);
  if (val >= 1000000000) {
    return `${(val / 1000000000).toFixed()}B`;
  } else if (val >= 1000000) {
    return `${(val / 1000000).toFixed()}M`;
  } else if (val >= 1000) {
    return `${(val / 1000).toFixed()}K`;
  } else {
    return val.toString();
  }
}

function customDateFormat(value: number | string): string {
  // Convert the value to a date
  const date =
    typeof value === "number"
      ? new Date(value * 1000)
      : new Date(parseInt(value) * 1000);
  console.log(date);
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return ""; // Return an empty string for invalid dates
  }
  // Extract day, month, and year (last two digits)
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear().toString();

  // Format the date as "day-month-year"
  return `${day} ${month} ${year}`;
}

export { bigNumberFormatter, customDateFormat };
