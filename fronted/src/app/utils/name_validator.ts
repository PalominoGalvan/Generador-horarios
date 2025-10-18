export default function validateName(name: string): boolean {
    return /^[a-zA-Z ]/.test(name);
}