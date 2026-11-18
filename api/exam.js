export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan." });
  }

  const gasUrl = process.env.KTR_GAS_WEBAPP_URL;
  const secret = process.env.VERCEL_API_SECRET;
  if (!gasUrl || !secret) {
    return res.status(500).json({ success: false, message: "Environment variable API belum lengkap." });
  }

  const payload = req.body;
  const allowed = ["startExam", "saveAnswer", "submitExam"];
  if (!payload || !allowed.includes(payload.action) || !Array.isArray(payload.args)) {
    return res.status(400).json({ success: false, message: "Permintaan ujian tidak valid." });
  }

  const gasActions = {
    startExam: "startExam",
    saveAnswer: "saveAnswer",
    submitExam: "submitExam"
  };

  try {
    const response = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: gasActions[payload.action],
        secret,
        args: payload.args
      })
    });
    const result = await response.json();
    if (!response.ok || !result || result.success === false) {
      return res.status(502).json({
        success: false,
        message: (result && result.message) || "Gagal memproses ujian."
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("POST /api/exam:", error);
    return res.status(502).json({
      success: false,
      message: "Tidak dapat terhubung ke layanan ujian. Silakan coba kembali."
    });
  }
}
