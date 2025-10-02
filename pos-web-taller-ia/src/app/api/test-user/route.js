import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const DEMO_USER = {
  correo: "demo@example.com",
  nombre_usuario: "demo",
  password: "Demo1234",
};

export async function GET() {
  try {
    const hashedPassword = await hashPassword(DEMO_USER.password);

    const usuario = await prisma.users.upsert({
      where: { correo: DEMO_USER.correo },
      update: {
        nombre_usuario: DEMO_USER.nombre_usuario,
        password: hashedPassword,
        activo: true,
      },
      create: {
        correo: DEMO_USER.correo,
        nombre_usuario: DEMO_USER.nombre_usuario,
        password: hashedPassword,
        activo: true,
      },
    });

    return NextResponse.json({
      message: "Usuario de demostración listo para iniciar sesión.",
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre_usuario: usuario.nombre_usuario,
        activo: usuario.activo,
      },
      credenciales: {
        usuario: DEMO_USER.nombre_usuario,
        password: DEMO_USER.password,
      },
    });
  } catch (error) {
    console.error("Error creando usuario de prueba:", error);
    return NextResponse.json(
      { message: "No se pudo preparar el usuario de demostración." },
      { status: 500 }
    );
  }
}
