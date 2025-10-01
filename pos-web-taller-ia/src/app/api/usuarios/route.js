import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const usuarios = await prisma.users.findMany({
      orderBy: { id: "asc" },
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

    const usuario = await prisma.users.create({
      data: {
        correo,
        password,
        nombre_usuario,
        activo: Boolean(activo),
      },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    console.error("Error creando usuario:", error);
    return NextResponse.json(
      { message: "No se pudo crear el usuario." },
      { status: 500 }
    );
  }
}
