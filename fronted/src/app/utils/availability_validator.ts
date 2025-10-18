export default function validateAvailability(availabilities: string[]): boolean {
    let valid_availabilities = 0;
    for (const availability of availabilities) {
        valid_availabilities += Number(/^[0-1]{24,}/.test(availability));
    }
    return valid_availabilities == 7;
}