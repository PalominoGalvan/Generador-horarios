import mongoose from "mongoose";
import validateName from "@/app/utils/name_validator";
import phoneValidator from "@/app/utils/phone_validator";
import validateNUA from "@/app/utils/nua_validator";
import validateEmails from "@/app/utils/emails_validator";
import validateUgtoEmail from "@/app/utils/ugto_email_validator";

export interface Teacher extends mongoose.Document {
    nua: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    phoneNumber: string;
    emailAddress: string[];
    instEmail: string;
    password: string;
}

const TeacherSchema = new mongoose.Schema<Teacher>({
    nua: {
        type: String,
        validate: {
            validator: validateNUA,
            message: "La NUA debe contener exactamente 6 digitos"
        },
    },
    firstName: {
        type: String,
        validate: {
            validator: validateName,
            message: "El nombre solo debe contener letras y espacios"
        },
        required: [true, "El nombre es un campo obligatorio"],
    },
    lastName: {
        type: String,
        validate: {
            validator: validateName,
            message: "El apellido solo debe contener letras y espacios"
        },
        required: [true, "El apellido es un campo obligatorio"],
    },
    isActive: {
        type: Boolean,
        default: true,
        required: [true, "Se debe especificar si es personal activo o jubilado"],
    },
    phoneNumber: {
        type: String,
        validator: {
            validate: phoneValidator,
            message: "El numero de telefono no es valido"
        },
        required: [true, "El telefono es un campo obligatorio"],
    },
    emailAddress: {
        type: [String],
        validate: {
            validator: validateEmails,
            message: "El campo debe tener al menos un correo. Alguno se repite o no es valido"
        },
        required: [true, "El campo de correos es obligatorio"]
    },
    instEmail: {
        type: String,
        validate: {
            validator: (val: string) => (val.length == 0 || validateUgtoEmail(val)),
            message: "El campo de correo institucional no es valido"
        }
    },
    password: {
        type: String,
        required: [true, "El campo de contraseña es obligatorio"]
    }
});

TeacherSchema.index({ firstName: 1, lastName: 1, emailAddress: 1 }, { unique: true });

export default mongoose.models.Teacher || mongoose.model<Teacher>("Teacher", TeacherSchema);