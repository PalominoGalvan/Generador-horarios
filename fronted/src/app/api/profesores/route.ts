import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Availability from "../../../../models/Availability";
import { parse } from 'cookie';
import { JwtPayload, verify } from "jsonwebtoken";
import validateSubject from "@/app/utils/subject_validator";
import validateAvailability from "@/app/utils/availability_validator";

const required_fields = ['archHours', 'desiredSubjects', 'hasAdministrativePos', 'availability'];

const verifyJwt = (cookieHeader: string | null): JwtPayload | null => {
    if (!cookieHeader || !parse(cookieHeader).authToken) {
        return null;
    }
    return verify(parse(cookieHeader).authToken!, process.env.JWT_SECRET!) as JwtPayload;
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    try {
        for (const field of required_fields) {
            if (!data[field] || data[field].length == 0) {
                return NextResponse.json({ message: `El campo ${field} no puede estar vacío.`}, { status: 405 });
            }
        }
        const token = verifyJwt(req.headers.get('cookie'));
        if (!token) {
            return NextResponse.json({ message: "Hubo un error. Necesitas volver a iniciar sesion." }, { status: 404 });
        }
        await dbConnect();
        const { archHours, desiredSubjects, hasAdministrativePos, availability, ...other } = data;
        if (Number.isInteger(archHours) && archHours >= 0) {
            return NextResponse.json({ message: 'El número de horas es inválido.' }, { status: 405 });
        }
        for (const subject of desiredSubjects) {
            if (!validateSubject(subject)) {
                return NextResponse.json({ message: `La materia ${subject} no es valida.` }, { status: 405 });
            }
        }
        if (!validateAvailability(availability)) {
            return NextResponse.json({ message: "La disponibilidad no es valida" }, { status: 405 });
        }
        await Availability.updateOne(
            { teacherId: token.id },
            {
                teacherId: token.id,
                archHours: archHours, 
                availability: availability, 
                desiredSubjects: desiredSubjects, 
                hasAdministrativePos: hasAdministrativePos 
            },
            { upsert: true, runValidators: true }
        )
        return NextResponse.json({ message: "Disponibilidad actualizada exitosamente" }, { status: 202 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 505 });
    }
}