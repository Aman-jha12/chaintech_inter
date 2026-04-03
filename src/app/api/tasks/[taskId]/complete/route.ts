import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ taskId: string }>;
};

export async function PATCH(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.completed) {
      return NextResponse.json(
        { error: "Task is already marked as completed" },
        { status: 400 }
      );
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completed: true },
    });

    return NextResponse.json({ task }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to mark task as completed. Please try again." },
      { status: 500 }
    );
  }
}