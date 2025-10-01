import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        password,
        activo: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { message: "Credenciales inválidas o usuario inactivo." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "El usuario existe.",
      usuario: {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        correo: usuario.correo,
      },
    });
  } catch (error) {
    console.error("Error iniciando sesión:", error);
    return NextResponse.json(
      { message: "No se pudo procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}
