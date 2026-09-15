const WHATSAPP_NUMBER = "923371377555"; // X Cafe Peshawar

export function waLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function shareTokenMessage(token: string, waitMins: number): string {
  const wait =
    waitMins > 0
      ? waitMins < 60
        ? `${waitMins} min`
        : `${Math.floor(waitMins / 60)}h ${waitMins % 60}m`
      : "bas abhi";
  return `🍕 Assalam-o-Alaikum! Mera token *${token}* hai at X Cafe Peshawar.\n⏳ Estimated wait: *${wait}*\n\n# میں ہوں سب سے سستا`;
}

export function shareNative(token: string, waitMins: number) {
  const text = shareTokenMessage(token, waitMins);
  if (navigator.share) {
    navigator.share({ title: "SABAR — X Cafe", text }).catch(() => {});
  } else {
    window.open(waLink(text), "_blank");
  }
}
