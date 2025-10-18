import mongoose from "mongoose";
import validateName from "@/app/utils/name_validator";
import phoneValidator from "@/app/utils/phone_validator";
import validateEmail from "@/app/utils/email_validator";
import validateNUA from "@/app/utils/nua_validator";

export interface Teacher extends mongoose.Document {
    nua: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    phoneNumber: string;
    emailAddress: string[];
    passwordConfirm: string;
    password: string;
}

const TeacherSchema = new mongoose.Schema<Teacher>({
    nua: {
        type: String,
        validate: {
            validator: validateNUA,
            message: "La NUA debe contener exactamente 6 digitos"
        },
        required: [true, "El campo de la NUA es requerido"]
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
            validator: function(values: string[]) {
                let valid_emails = 0;
                const n = values.length;
                const unique_emails = new Set<String>();
                for (const value of values) {
                    unique_emails.add(value);
                    valid_emails += Number(validateEmail(value));
                }
                return n > 0 && valid_emails == n && unique_emails.size == n;
            },
            message: "El campo debe tener al menos un correo. Alguno se repite o no es valido"
        },
        required: [true, "El campo de correos es obligatorio"]
    }
});

TeacherSchema.index({ firstName: 1, lastName: 1, emailAddress: 1 }, { unique: true });

export default mongoose.models.Teacher || mongoose.model<Teacher>("Teacher", TeacherSchema);