import { prisma } from '@backend/config/db';
import { Bookmark } from '@prisma/client';

export const toggleBookmark = async (userId: string, questionId: string): Promise<{ bookmarked: boolean }> => {
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_questionId: {
        userId,
        questionId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: {
        id: existing.id,
      },
    });
    return { bookmarked: false };
  } else {
    await prisma.bookmark.create({
      data: {
        userId,
        questionId,
      },
    });
    return { bookmarked: true };
  }
};

export const getBookmarkedQuestions = async (userId: string): Promise<any[]> => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      question: {
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          difficulty: true,
          category: true,
          topic: true,
          estimatedTime: true,
          companies: true,
          isPremium: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return bookmarks.map((b) => ({
    ...b.question,
    isBookmarked: true,
  }));
};
