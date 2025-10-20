import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Teacher from "../../../../models/Teacher";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";

const required_fields = ['emailAddress', 'password'];

export async function POST(req: NextRequest) {
    const data = await req.json();
    try {
        await dbConnect();
        for (const field of required_fields) {
            if (!data[field] || data[field].length == 0) {
                return NextResponse.json({ message: `El campo ${field} no puede estar vacío.`}, { status: 405 });
            }
        }
        let { emailAddress, password, ...other } = data;
        emailAddress = emailAddress.toLowerCase();
        const teacher = await Teacher.findOne(
            { emailAddress },
            { 
                    _id: true, 
                    firstName: true, 
                    lastName: true,
                    password: true, 
            }  
        )
        if (!teacher) {
            return NextResponse.json({ message: "El correo o contraseña son incorrectos." }, { status: 404 });
        }
        const password_matches = await compare(password, teacher.password);
        if (!password_matches) {
            return NextResponse.json({ message: "El correo o contraseña son incorrectos." }, { status: 404 });
        }
        const token = sign(
            { id: teacher.id, name: `${teacher.firstName} ${teacher.lastName}` },
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
        return Response.json({ status: 505, message: error.message });
    }
}