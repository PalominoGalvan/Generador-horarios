import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Teacher from "../../../../models/Teacher";
import { hash } from "bcrypt";
import validateNUA from "@/app/utils/nua_validator";
import validateName from "@/app/utils/name_validator";
import phoneValidator from "@/app/utils/phone_validator";
import validatePassword from "@/app/utils/password_validator";
import validateEmails from "@/app/utils/emails_validator";
import { sign } from "jsonwebtoken";

const required_fields = ['firstName', 'lastName', 'emailAddress', 'password'];

export async function POST(req: NextRequest) {
    const data = await req.json();
    try {
        await dbConnect();
        for (const field of required_fields) {
            if (!data[field] || data[field].length == 0) {
                return NextResponse.json({ message: `El campo ${field} no puede estar vacío.`}, { status: 405 });
            }
        }
        let { nua, firstName, lastName, phoneNumber, emailAddress, password, ...other } = data;
        firstName = firstName.toUpperCase();
        lastName = lastName.toUpperCase();
        if (nua && !validateNUA(nua)) {
            return NextResponse.json({ message: "La NUE no es valida." }, { status: 405 });
        }
        if (!validateName(firstName)) {
            return NextResponse.json({ message: "El campo de nombres no es valido." }, { status: 405 });
        }
        if (!validateName(lastName)) {
            return NextResponse.json({ message: "El campo de apellidos no es valido." }, { status: 405 });
        }
        if (!phoneValidator(phoneNumber)) {
            return NextResponse.json({ message: "El campo de numero de teléfono no es valido." }, { status: 405 });
        }
        if (!validatePassword(password)) {
            return NextResponse.json({ message: "El campo de contraseña no es valido." }, { status: 405 });
        }
        if (!validateEmails(emailAddress)) {
            return NextResponse.json({ message: "El campo de correos no es valido." }, { status: 405 });
        }
        let existing = await Teacher.findOne({ firstName, lastName });
        if (existing) {
            return Response.json({ status: 405, message: "Ya existe un profesor con esa combinacion de nombre y apellido." });
        }
        existing = await Teacher.findOne({ emailAddress: { $in: emailAddress } });
        if (existing) {
            return Response.json({ status: 405, message: "Ya existe un profesor con ese correo electrónico" });
        }
        existing = await Teacher.findOne({ phoneNumber });
        if (existing) {
            return Response.json({ status: 405, message: "Ya existe un profesor con ese numero de teléfono." });
        }
        password = await hash(password, 10);
        existing = await Teacher.create({ nua, firstName, lastName, phoneNumber, emailAddress, password });
        if (!existing) {
            return Response.json({ status: 505, message: "Hubo un error inesperado." });
        }
        const token = sign(
            { id: existing.id, name: `${existing.firstName} ${existing.lastName}` },
            process.env.JWT_SECRET!,
            { expiresIn: Number(process.env.JWT_EXPIRES_IN!) }
        );
        const response = NextResponse.json({ message: "Has iniciado sesion exitosamente." }, { status: 200 });
        response.cookies.set('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: Number(process.env.JWT_EXPIRES_IN),
            path: '/'
        });
        return response;
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 505 });
    }
}