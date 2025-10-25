import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import verifyJwt from "@/app/utils/verify_jwt";
import Availability from "../../../../models/Availability";

export async function GET(req: NextRequest) {
    try {
        const token = verifyJwt(req.headers.get('cookie'));
        if (!token) {
            return NextResponse.json({ message: "Hubo un error, necesitas volver a iniciar sesion" }, { status: 404 }); 
        }
        const filter = new RegExp(process.env.ALLOW_CSV!.split(" ").join("|"), 'g');
        if (!filter.test(token.name)) {
            return NextResponse.json({ message: "Hubo un error, necesitas volver a iniciar sesion" }, { status: 404 }); 
        }
        await dbConnect();
        const results = await Availability.find({}, 'teacherId').populate('teacherId', 'firstName lastName');
        if (!results) {
            return NextResponse.json({ message: "Hubo un error, la coleccion esta vacia" }, { status: 500 }); 
        }
        const rows = results.map((availability) => {
            const { firstName, lastName } = availability.teacherId;
            return `${firstName},${lastName}`;
        })
        return new NextResponse(Buffer.from(['Nombres,Apellidos', ...rows].join("\n")), { 
            headers: {
                'Content-Type': 'text/cvs', 
                'Content-Disposition': 'attachment; filename="nombres.csv"',
                } 
            }
        );
    } catch (error: any) {
        console.log(error.message);
        return NextResponse.json({ message: "Hubo un error" }, { status: 500 });
    }
}