import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const SESSION_COOKIE_NAME = "session_user";

function createSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...createSessionCookieOptions(),
    maxAge: 0,
  });
}

export async function GET(request) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
      return NextResponse.json(
        { message: "Sesión no encontrada. Inicia sesión nuevamente." },
        { status: 401 }
      );
    }

    const userId = Number(sessionCookie.value);

    if (!Number.isInteger(userId) || userId <= 0) {
      const response = NextResponse.json(
        { message: "Sesión inválida. Inicia sesión nuevamente." },
        { status: 401 }
      );
      clearSessionCookie(response);
      return response;
    }

    const usuario = await prisma.users.findFirst({
      where: {
        id: userId,
        activo: true,
      },
      select: {
        id: true,
        nombre_usuario: true,
        correo: true,
      },
    });

    if (!usuario) {
      const response = NextResponse.json(
        { message: "Sesión expirada o usuario inactivo." },
        { status: 401 }
      );
      clearSessionCookie(response);
      return response;
    }

    return NextResponse.json({
      message: "Sesión válida.",
      usuario,
    });
  } catch (error) {
    console.error("Error validando la sesión:", error);
    return NextResponse.json(
      { message: "No se pudo validar la sesión." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre_usuario, password } = body;

    if (!nombre_usuario || !password) {
      return NextResponse.json(
        { message: "nombre_usuario y password son obligatorios." },
        { status: 400 }
      );
    }

    const usuario = await prisma.users.findFirst({
      where: {
        nombre_usuario,
        activo: true,
      },
      select: {
        id: true,
        nombre_usuario: true,
        correo: true,
        password: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "Credenciales inválidas o usuario inactivo." },
        { status: 401 }
      );
    }

    const passwordCorrecto = await verifyPassword(password, usuario.password);

    if (!passwordCorrecto) {
      return NextResponse.json(
        { message: "Credenciales inválidas o usuario inactivo." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      message: "Inicio de sesión exitoso.",
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo,
      },
    });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      String(usuario.id),
      createSessionCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("Error iniciando sesión:", error);
    return NextResponse.json(
      { message: "No se pudo procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
