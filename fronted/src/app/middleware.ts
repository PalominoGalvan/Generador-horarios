import { parse } from "cookie";
import { JwtPayload, verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const verifyJwt = (cookieHeader: string | null): JwtPayload | null => {
    if (!cookieHeader || !parse(cookieHeader).authToken) {
        return null;
    }
    return verify(parse(cookieHeader).authToken!, process.env.JWT_SECRET!) as JwtPayload;
}

export async function middleware(req: NextRequest) {
    const token = verifyJwt(req.headers.get('cookie'));
    console.log(token);
    if (!token && req.nextUrl.pathname.includes('/formulario')) {
        const response = NextResponse.redirect(new URL('/', req.url));
        response.cookies.delete('authToken');
        return response;
    }
    return NextResponse.next();
}

export const config = {
    matcher: '/formulario/'
}