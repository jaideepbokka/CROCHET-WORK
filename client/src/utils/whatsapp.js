/**
 * WhatsApp Helper for Stitch & Hook
 * Business Phone: +91 6305616316
 */

export const BUSINESS_PHONE = '6305616316';
export const FORMATTED_PHONE = '+91 6305616316';

/**
 * Generate Direct WhatsApp Purchase Link for a Single Item ("Buy Now")
 */
export const createSingleProductWhatsAppLink = ({
  product,
  quantity = 1,
  selectedColor = '',
  user = null,
  customNotes = ''
}) => {
  const totalPrice = product.price * quantity;
  const colorStr = selectedColor ? ` (${selectedColor})` : '';

  let message = `🧵 *STITCH & HOOK - ORDER INQUIRY* 🧵\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `✨ *Product:* ${product.name}${colorStr}\n`;
  message += `📦 *Quantity:* ${quantity}\n`;
  message += `🏷️ *Unit Price:* ₹${product.price}\n`;
  message += `💰 *Total Amount:* ₹${totalPrice}\n\n`;

  if (user) {
    message += `👤 *Customer Details:*\n`;
    message += `• *Name:* ${user.name || 'Valued Customer'}\n`;
    if (user.phone) message += `• *Phone:* ${user.phone}\n`;
    if (user.email) message += `• *Email:* ${user.email}\n`;

    const defaultAddress = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
    if (defaultAddress) {
      message += `📍 *Delivery Address:*\n`;
      message += `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.state} - ${defaultAddress.pincode}\n`;
    }
  } else {
    message += `👤 *Customer Details:* (Guest Checkout)\n`;
  }

  if (customNotes) {
    message += `\n📝 *Special Request:* ${customNotes}\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Hi Stitch & Hook! 👋 I would like to order this handmade crochet piece and coordinate payment. Please let me know how to proceed! ✨🧶`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/91${BUSINESS_PHONE}?text=${encodedMessage}`;
};

/**
 * Generate WhatsApp Purchase Link for Full Cart Checkout
 */
export const createCartWhatsAppLink = ({
  cartItems = [],
  user = null,
  customAddress = null,
  promoDiscount = 0
}) => {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const total = Math.max(0, subtotal - promoDiscount);

  let message = `🧵 *STITCH & HOOK - BAG CHECKOUT* 🧵\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `🛍️ *Order Summary (${cartItems.length} items):*\n`;

  cartItems.forEach((item, idx) => {
    const colorStr = item.selectedColor ? ` [${item.selectedColor}]` : '';
    message += `${idx + 1}. *${item.product.name}*${colorStr}\n`;
    message += `   Qty: ${item.quantity} × ₹${item.product.price} = ₹${item.product.price * item.quantity}\n`;
  });

  message += `\n`;
  if (promoDiscount > 0) {
    message += `💵 *Subtotal:* ₹${subtotal}\n`;
    message += `🎉 *Discount Applied:* -₹${promoDiscount}\n`;
  }
  message += `💰 *Final Total:* ₹${total}\n\n`;

  // Customer & Shipping Info
  if (user) {
    message += `👤 *Customer Info:*\n`;
    message += `• *Name:* ${user.name || 'Valued Customer'}\n`;
    if (user.phone) message += `• *Phone:* ${user.phone}\n`;
    if (user.email) message += `• *Email:* ${user.email}\n`;
  }

  const shippingAddr = customAddress || user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  if (shippingAddr) {
    message += `📍 *Delivery Address:*\n`;
    message += `${shippingAddr.fullName ? shippingAddr.fullName + ', ' : ''}${shippingAddr.street}, ${shippingAddr.city}, ${shippingAddr.state ? shippingAddr.state + ' - ' : ''}${shippingAddr.pincode}\n`;
    if (shippingAddr.phone) message += `📞 Contact: ${shippingAddr.phone}\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Hi Stitch & Hook! 👋 I would like to place this cart order and coordinate payment. Please confirm availability! ✨🧶`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/91${BUSINESS_PHONE}?text=${encodedMessage}`;
};

/**
 * Generate Custom Crochet Inquiry WhatsApp Link
 */
export const createCustomInquiryWhatsAppLink = ({
  user = null,
  category = 'Custom Request',
  description = '',
  preferredColors = '',
  budget = ''
}) => {
  let message = `✨ *STITCH & HOOK - CUSTOM CROCHET COMMISSION* ✨\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `🎨 *Category:* ${category}\n`;
  if (preferredColors) message += `🧶 *Preferred Colors/Palette:* ${preferredColors}\n`;
  if (budget) message += `💵 *Estimated Budget:* ₹${budget}\n`;
  message += `📝 *Design Details / Reference:*\n${description}\n\n`;

  if (user) {
    message += `👤 *Contact Details:*\n`;
    message += `• Name: ${user.name}\n`;
    if (user.phone) message += `• Phone: ${user.phone}\n`;
    if (user.email) message += `• Email: ${user.email}\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `Hi Stitch & Hook! I’m looking to commission a custom handmade crochet design. Can you please check if you can craft this for me? 🌸🧶`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/91${BUSINESS_PHONE}?text=${encodedMessage}`;
};
