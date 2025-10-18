import validateAvailability from "@/app/utils/availability_validator";
import mongoose from "mongoose";

export interface Availability extends mongoose.Document {
    teacherId: string;
    contractType: number;
    maxHoursRequested: number;
    department: Number;
    availability: string[];
    desiredSubjects: string[];
    hasAdministrativePosition: boolean;
    maxHours: number;
}

const AvailabilitySchema = new mongoose.Schema<Availability>({
    teacherId: {
        type: String,
        required: [true, "La disponibilidad debe estar asignada a un maestro"]
    },
    contractType: {
        type: Number,
        min: 0,
        max: 2,
        validate: {
            validator: (val: number) => (Number.isInteger(val) && val >= 0 && val <= 2),
            message: "El campo de nombramiento debe contener un numero entero entre 0 y 2"
        },
        required: [true, "El campo de nombramiento es obligatorio"]
    },
    maxHoursRequested: {
        type: Number,
        validate: {
            validator: Number.isInteger,
            message: "El campo de horas maximas solicitadas debe contener un numero entero "
        },
        required: [true, "El campo de horas maximas solicitadas es obligatorio"]
    },
    department: {
        type: Number,
        min: 0,
        max: 2,
        validate: {
            validator: (val: number) => (Number.isInteger(val) && val >= 0 && val <= 2),
            message: "El campo de departamento debe contener un numero entero entre 0 y 2"
        },
        required: [true, "El campo del departamento es obligatorio"]
    },
    availability: {
        type: [String],
        validate: {
            validator: validateAvailability,
            message: "El campo de disponibilidad debe contener un numero binario de al menos 24 digitos",
        },
        required: [true, "El campo de disponibilidad es obligatorio"]
    },
    desiredSubjects: {
        type: [String],
        validate: {
            validator: (val: string[]) => (val.length > 0),
            message: "Se debe seleccionar al menos una materia"
        },
        required: [true, "El campo de materias deseadas es obligatorio"]
    },
    hasAdministrativePosition: {
        type: Boolean,
        default: false,
        required: [true, "El campo de posicion administrativa es obligatorio"]
    },
    maxHours: {
        type: Number,
        default: 28,
        validate: {
            validator: (val: number) => (Number.isInteger(val) && val > 0),
            message: "El campo de cantidad maxima de horas debe contener un numero entero positivo"
        },
        required: [true, "El campo de horas maximas es obligatorio"]
    }
})

export default mongoose.models.Availability || mongoose.model<Availability>("Availability", AvailabilitySchema);