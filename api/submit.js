export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  const gasUrl = process.env.KTR_GAS_WEBAPP_URL;
  const secret = process.env.VERCEL_API_SECRET;

  if (!gasUrl || !secret) {
    return res.status(500).json({ success: false, message: "Environment variable API belum lengkap." });
  }

  try {
    const payload = req.body;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({ success: false, message: "Data biodata tidak valid." });
    }

    const response = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submitBiodata",
        secret,
        data: payload
      })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      return res.status(502).json({
        success: false,
        message: result.message || "Gagal menyimpan biodata."
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("POST /api/submit:", error);
    return res.status(502).json({
      success: false,
      message: "Tidak dapat menyimpan biodata saat ini."
    });
  }
}
