export const subjects = [
    "XD",
    "LUL"
];

export default function validateSubject(subject: string): boolean {
    return subject in subjects;
}