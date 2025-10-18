export default function phoneValidator(phone: string): boolean {
    // Valida que sean exactamente 10 dígitos numéricos
    return /^[0-9]{10}$/.test(phone);
}
