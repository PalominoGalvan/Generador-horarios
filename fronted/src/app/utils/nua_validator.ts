export default function validateNUA(nua: string): boolean {
    if (nua.length == 0) {
        return true;
    }
    return /^[0-9]{5}$/.test(nua);
}