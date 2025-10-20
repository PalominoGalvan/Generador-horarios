import validateAvailability from "@/app/utils/availability_validator";
import validateSubject from "@/app/utils/subject_validator";
import mongoose from "mongoose";

export interface Availability extends mongoose.Document {
    teacherId: mongoose.Types.ObjectId;
    contractType: number;
    availability: string[];
    desiredSubjects: string[];
    hasAdministrativePos: boolean;
}

const AvailabilitySchema = new mongoose.Schema<Availability>({
    teacherId: {
        ref: "Teacher",
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "La disponibilidad debe estar asignada a un maestro"]
    },
    contractType: {
        type: Number,
        min: 0,
        max: 3,
        validate: {
            validator: (val: number) => (Number.isInteger(val) && val >= 0 && val <= 3),
            message: "El campo de nombramiento debe contener un numero entero entre 0 y 3"
        },
        required: [true, "El campo de nombramiento es obligatorio"]
    },
    availability: {
        type: [String],
        validate: {
            validator: validateAvailability,
            message: "El campo de disponibilidad debe contener un numero binario de 14 digitos",
        },
        required: [true, "El campo de disponibilidad es obligatorio"]
    },
    desiredSubjects: {
        type: [String],
        validate: {
            validator: function(vals: string[]) {
                if (vals.length == 0) {
                    return false;
                }
                for (const val of vals) {
                    if (!validateSubject(val)) {
                        return false
                    }
                }
                return true;
            },
            message: "Se debe seleccionar al menos una materia"
        },
        required: [true, "El campo de materias deseadas es obligatorio"]
    },
    hasAdministrativePos: {
        type: Boolean,
        default: false,
        required: [true, "El campo de posicion administrativa es obligatorio"]
    }
})

export default mongoose.models.Availability || mongoose.model<Availability>("Availability", AvailabilitySchema);