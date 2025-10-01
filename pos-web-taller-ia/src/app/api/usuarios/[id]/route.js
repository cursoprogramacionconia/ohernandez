import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function parseId(params) {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_request, { params }) {
  const id = parseId(params);

  if (!id) {
    return NextResponse.json({ message: "Identificador inválido." }, { status: 400 });
  }

  try {
    const usuario = await prisma.users.findUnique({ where: { id } });

    if (!usuario) {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return NextResponse.json({ message: "No se pudo obtener el usuario." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const id = parseId(params);

  if (!id) {
    return NextResponse.json({ message: "Identificador inválido." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { correo, password, nombre_usuario, activo } = body;

    const data = {};
    if (correo !== undefined) data.correo = correo;
    if (password !== undefined) data.password = password;
    if (nombre_usuario !== undefined) data.nombre_usuario = nombre_usuario;
    if (activo !== undefined) data.activo = Boolean(activo);

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { message: "No se proporcionaron campos para actualizar." },
        { status: 400 }
      );
    }

    const usuario = await prisma.users.update({
      where: { id },
      data,
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ message: "No se pudo actualizar el usuario." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const id = parseId(params);

  if (!id) {
    return NextResponse.json({ message: "Identificador inválido." }, { status: 400 });
  }

  try {
    await prisma.users.delete({ where: { id } });
    return NextResponse.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Usuario no encontrado." }, { status: 404 });
    }
    return NextResponse.json({ message: "No se pudo eliminar el usuario." }, { status: 500 });
  }
}
