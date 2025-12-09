let cachedIP = null;

export async function getPublicIP() {
  if (cachedIP) return cachedIP;

  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    cachedIP = data.ip;
    return cachedIP;
  } catch (err) {
    return "unknown";
  }
}
