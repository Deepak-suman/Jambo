import QRCode from "qrcode";

export async function generateQRForTable(tableNumber, baseUrl) {
  // baseUrl examples: "http://localhost:3000" or "https://my-restaurant.com"
  const orderUrl = `${baseUrl}/menu?table=${tableNumber}`;
  
  try {
    // Generate QR code as a data URI (base64 string)
    const qrDataUrl = await QRCode.toDataURL(orderUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    return qrDataUrl;
  } catch (error) {
    console.error("QR Generation Error:", error);
    throw new Error("Failed to generate QR code");
  }
}
