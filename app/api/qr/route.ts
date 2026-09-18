import { jsonError } from "@/lib/http";
import QRCode from "qrcode";

export async function GET(request: Request) {
  try {
    const target = new URL(request.url).searchParams.get("url");
    if (!target) return jsonError("Missing url.");
    const dataUrl = await QRCode.toDataURL(target, {
      margin: 1,
      width: 480,
      color: { dark: "#0E0E0E", light: "#E8E6DF" },
    });
    return Response.json({ dataUrl });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not build QR.");
  }
}
