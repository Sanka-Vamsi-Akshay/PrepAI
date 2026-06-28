import { prisma } from '@backend/config/db';
import { Question } from '@prisma/client';
import { GetQuestionsQueryInput } from '@backend/validators/question.validator';
import { NotFoundError } from '@backend/utils/appError';

interface PaginatedQuestionsResult {
  questions: Omit<Question, 'submissions'>[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getQuestions = async (
  query: GetQuestionsQueryInput,
  userId?: string
): Promise<PaginatedQuestionsResult> => {
  const page = parseInt(query.page?.toString() || '1', 10);
  const limit = parseInt(query.limit?.toString() || '10', 10);
  const { search, difficulty, category, topic } = query;
  
  const skip = (page - 1) * limit;

  // Compose dynamic Prisma filters
  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }

  if (topic) {
    where.topic = { equals: topic, mode: 'insensitive' };
  }

  if (userId && query.bookmarked === 'true') {
    where.bookmarks = {
      some: {
        userId,
      },
    };
  }

  // Execute database count and search concurrently
  const [total, questions] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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
    }),
  ]);

  let bookmarkedQuestionIds = new Set<string>();
  if (userId) {
    const userBookmarks = await prisma.bookmark.findMany({
      where: { userId },
      select: { questionId: true },
    });
    bookmarkedQuestionIds = new Set(userBookmarks.map((b) => b.questionId));
  }

  const questionsWithBookmark = questions.map((q) => ({
    ...q,
    isBookmarked: bookmarkedQuestionIds.has(q.id),
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    questions: questionsWithBookmark,
    metadata: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getQuestionById = async (id: string, userId?: string): Promise<any> => {
  const question = await prisma.question.findUnique({
    where: { id },
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
  });

  if (!question) {
    throw new NotFoundError('Question not found');
  }

  let isBookmarked = false;
  if (userId) {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId: id,
        },
      },
    });
    isBookmarked = !!bookmark;
  }

  return {
    ...question,
    isBookmarked,
  };
};
