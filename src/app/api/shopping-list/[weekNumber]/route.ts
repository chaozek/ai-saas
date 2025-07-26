import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ weekNumber: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { weekNumber: weekNumberStr } = await params;
    const weekNumber = parseInt(weekNumberStr);
    if (isNaN(weekNumber)) {
      return NextResponse.json({ error: 'Invalid week number' }, { status: 400 });
    }

    // Find the project that contains the shopping list for this week
    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
        name: {
          contains: `Nákupní seznam týden ${weekNumber}`
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    if (projects.length === 0 || !projects[0].messages.length) {
      return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
    }

    const content = projects[0].messages[0].content;
    // Remove the prefix "Zde je váš organizovaný nákupní seznam pro týden X:\n\n"
    const shoppingListContent = content.replace(/^Zde je váš organizovaný nákupní seznam pro týden \d+:\n\n/, '');

    return NextResponse.json({
      content: shoppingListContent,
      projectId: projects[0].id,
      createdAt: projects[0].createdAt
    });

  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}