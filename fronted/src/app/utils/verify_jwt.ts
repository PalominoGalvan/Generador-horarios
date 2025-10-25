import { parse } from "cookie";
import { JwtPayload, verify } from "jsonwebtoken";

const verifyJwt = (cookieHeader: string | null): JwtPayload | null => {
    if (!cookieHeader || !parse(cookieHeader).authToken) {
        return null;
    }
    return verify(parse(cookieHeader).authToken!, process.env.JWT_SECRET!) as JwtPayload;
}

export default verifyJwt;