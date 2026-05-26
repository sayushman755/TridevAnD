const rawApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

export const WHATSAPP_NUMBER =
    import.meta.env.VITE_WHATSAPP_NUMBER || "910000000000";

export const BRAND_NAME =
    import.meta.env.VITE_BRAND_NAME || "Tridev A&D Shine";

export const getCleanWhatsAppNumber = (number = WHATSAPP_NUMBER) => {
    return String(number).replace(/\D/g, "");
};

export const createWhatsAppLink = (message = "", number = WHATSAPP_NUMBER) => {
    const cleanNumber = getCleanWhatsAppNumber(number);
    const encodedMessage = encodeURIComponent(message);

    if (!encodedMessage) {
        return `https://wa.me/${cleanNumber}`;
    }

    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
};