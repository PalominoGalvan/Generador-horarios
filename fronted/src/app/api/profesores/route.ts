import type { NextRequest } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Teacher from "../../../../models/Teacher";
import Availability from "../../../../models/Availability";

export async function POST(req: NextRequest) {
    const data = await req.json();
    try {
        await dbConnect();
        const { nua, firstName, lastName, phoneNumber, emailAddress, ...other } = data;
        const teacher = await Teacher.findOneAndUpdate(
            { firstName, lastName, emailAddress }, 
            { nua, firstName, lastName, phoneNumber, emailAddress },
            { upsert: true, new: true, fields: { _id: true }  }
        )
        await Availability.updateOne(
            { _id: teacher.id },
            other,
            { upsert: true }
        )
        return Response.json({ status: 202, message: "Disponibilidad actualizada exitosamente" });
    } catch (error: any) {
        return Response.json({ status: 505, message: error.message });
    }
}