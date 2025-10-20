export default function validatePassword(password: string): boolean {
    return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?])/.test(password);
}