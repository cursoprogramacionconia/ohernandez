import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

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

    response.cookies.set("session_user", String(usuario.id), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error iniciando sesión:", error);
    return NextResponse.json(
      { message: "No se pudo procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
