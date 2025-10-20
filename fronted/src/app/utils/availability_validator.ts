export default function validateAvailability(availabilities: string[]): boolean {
    let valid_availabilities = 0;
    for (const availability of availabilities) {
        const current = Number(/^[0-1]{14}/.test(availability));
        valid_availabilities += current;
        if (current == 0) {
            console.log(availability);
        }
    }
    return valid_availabilities == 6;
}