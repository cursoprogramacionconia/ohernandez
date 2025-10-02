import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function GET() {
  try {
    const usuarios = await prisma.users.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        correo: true,
        nombre_usuario: true,
        activo: true,
        fecha_creacion: true,
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("Error fetching usuarios:", error);
    return NextResponse.json(
      { message: "No se pudieron obtener los usuarios." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { correo, password, nombre_usuario, activo = true } = body;

    if (!correo || !password || !nombre_usuario) {
      return NextResponse.json(
        { message: "correo, password y nombre_usuario son obligatorios." },
        { status: 400 }
      );
    }

    const correoNormalizado = correo.trim().toLowerCase();
    const nombreUsuarioNormalizado = nombre_usuario.trim();

    if (!correoNormalizado || !nombreUsuarioNormalizado) {
      return NextResponse.json(
        { message: "correo y nombre_usuario no pueden estar vacíos." },
        { status: 400 }
      );
    }

    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
    } catch (hashError) {
      return NextResponse.json(
        { message: hashError.message ?? "La contraseña no es válida." },
        { status: 400 }
      );
    }

    const usuario = await prisma.users.create({
      data: {
        correo: correoNormalizado,
        password: hashedPassword,
        nombre_usuario: nombreUsuarioNormalizado,
        activo: Boolean(activo),
      },
    });

    const { password: _password, ...usuarioSeguro } = usuario;

    return NextResponse.json(usuarioSeguro, { status: 201 });
  } catch (error) {
    console.error("Error creando usuario:", error);
    return NextResponse.json(
      { message: "No se pudo crear el usuario." },
      { status: 500 }
    );
  }
}
