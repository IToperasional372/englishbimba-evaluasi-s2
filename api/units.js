export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  const gasUrl = process.env.KTR_GAS_WEBAPP_URL;
  const secret = process.env.VERCEL_API_SECRET;

  if (!gasUrl || !secret) {
    return res.status(500).json({ success: false, message: "Environment variable API belum lengkap." });
  }

  try {
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getUnits", secret })
    });

    const result = await response.json();
    if (!response.ok || !result.success || !Array.isArray(result.units)) {
      return res.status(502).json({
        success: false,
        message: result.message || "Gagal mengambil daftar unit."
      });
    }

    return res.status(200).json({ success: true, units: result.units });
  } catch (error) {
    console.error("GET /api/units:", error);
    return res.status(502).json({
      success: false,
      message: "Tidak dapat terhubung ke layanan daftar unit."
    });
  }
}
