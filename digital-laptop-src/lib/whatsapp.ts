export function buildWhatsAppMessage(order: {
  id: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  totalAmount: number;
  items: Array<{ productName: string; quantity: number; price: number }>;
}): string {
  const itemsList = order.items
    .map((item) => `  • ${item.productName} x${item.quantity} — Rs. ${(item.price * item.quantity).toLocaleString()}`)
    .join("\n");

  const message = `🛍️ *New Order — DIGITAL LAPTOP*

📦 *Order ID:* ${order.id}

👤 *Customer Details:*
• Name: ${order.customerName}
• Phone: ${order.customerPhone}
• City: ${order.customerCity}
• Address: ${order.customerAddress}

🛒 *Items:*
${itemsList}

💰 *Total: Rs. ${order.totalAmount.toLocaleString()}*
💳 *Payment: Cash on Delivery (COD)*

Please confirm this order. Thank you! 🙏`;

  return encodeURIComponent(message);
}

export function getWhatsAppURL(orderId: string, order: Parameters<typeof buildWhatsAppMessage>[0]): string {
  const message = buildWhatsAppMessage(order);
  return `https://wa.me/923109516681?text=${message}`;
}
