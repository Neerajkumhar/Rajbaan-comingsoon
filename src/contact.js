export const PHONE_DIGITS = '9216487878'

export const WHATSAPP_MESSAGE =
  'Namaste Rajbaan, mujhe aapke masale aur dry fruits ke baare mein jaanna hai.'

const INTERNATIONAL = `91${PHONE_DIGITS}`

export const WHATSAPP_HREF = `https://wa.me/${INTERNATIONAL}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`

export const TEL_HREF = `tel:+${INTERNATIONAL}`
