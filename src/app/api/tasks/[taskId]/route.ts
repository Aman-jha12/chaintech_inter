import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Task title cannot be empty").optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    dueDate: z
      .string()
      .datetime({ message: "dueDate must be a valid ISO datetime" })
      .optional()
      .nullable(),
    category: z.string().trim().max(100).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update a task",
  });

type Params = {
  params: Promise<{ taskId: string }>;
};

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const payload = await req.json();
    const parsed = updateTaskSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid task payload" },
        { status: 400 }
      );
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: session.user.id,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        dueDate:
          parsed.data.dueDate === undefined
            ? undefined
            : parsed.data.dueDate
              ? new Date(parsed.data.dueDate)
              : null,
        category: parsed.data.category,
      },
    });

    return NextResponse.json({ task: updatedTask }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update task. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
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

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: "Task deleted" }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete task. Please try again." },
      { status: 500 }
    );
  }
}