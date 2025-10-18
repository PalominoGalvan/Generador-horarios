export default function validatePositiveNumber(num: number): boolean {
    return Number.isInteger(num) && num > 0;
}