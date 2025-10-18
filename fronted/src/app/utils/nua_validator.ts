export default function validateNUA(nua: string): boolean {
    return /[0-9]{6}/.test(nua);
}