import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createRedisSubscriber } from "@/lib/redis";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: deploymentId } = await params;

    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      select: { id: true, projectId: true, logs: true, project: { select: { userId: true } } },
    });

    if (!deployment) {
      return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
    }

    if (deployment.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const channel = `logs:${deploymentId}`;
    const subscriber = createRedisSubscriber();

    await subscriber.connect().catch(() => {});

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: string) => {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        const sendEvent = (event: string, data: string) => {
          controller.enqueue(encoder.encode(`event: ${event}\n`));
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        if (deployment.logs) {
          sendEvent("historical", deployment.logs);
        }

        sendEvent("connected", JSON.stringify({ deploymentId, channel }));

        await subscriber.subscribe(channel);

        subscriber.on("message", (ch, message) => {
          if (ch === channel) {
            send(message);
          }
        });

        request.signal.addEventListener("abort", () => {
          subscriber.unsubscribe(channel).catch(() => {});
          subscriber.quit().catch(() => {});
          controller.close();
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    console.error("Error streaming logs:", error);
    return NextResponse.json(
      { error: "Failed to stream logs" },
      { status: 500 }
    );
  }
}