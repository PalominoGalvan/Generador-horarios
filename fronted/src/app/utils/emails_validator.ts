import validateEmail from "./email_validator";

export default function validateEmails(values: string[]) {
    let valid_emails = 0;
    const n = values.length;
    const unique_emails = new Set<String>();
    for (const value of values) {
        unique_emails.add(value);
        valid_emails += Number(validateEmail(value));
    }
    return n > 0 && valid_emails == n && unique_emails.size == n;
}