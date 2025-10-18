export default function validateUgtoEmail(email: string): boolean {
    // Esta regex valida cualquiercosa@ugto.mx
    // ^[a-zA-Z0-9._%+-]+ valida el nombre de usuario
    // @ugto\.mx$ valida que termine exactamente con @ugto.mx
    return /^[a-zA-Z0-9._%+-]+@ugto\.mx$/.test(email);
}
