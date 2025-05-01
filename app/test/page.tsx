// app/page.tsx
"use client"

// this is a test page for the QR code, i will change everything to the confirmation page later
import { useEffect, useState } from "react"
import QRCode from "qrcode"

export default function HomePage() {
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  useEffect(() => {
    QRCode.toDataURL("https://google.com")
      .then((url: string) => setQrCodeUrl(url))
      .catch((err: Error) => console.error("QR generation failed", err))
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black p-4">
      <h1 className="text-2xl font-bold mb-4">QR Code for Google</h1>
      {qrCodeUrl ? (
        <img src={qrCodeUrl} alt="QR Code for Google.com" className="w-48 h-48" />
      ) : (
        <p>Generating QR Code...</p>
      )}
    </main>
  )
}
