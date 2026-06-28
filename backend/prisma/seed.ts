import { PrismaClient, Difficulty } from '@prisma/client';
import { codingProblems } from './codingProblemsData';

const prisma = new PrismaClient();

const questions = [
  // 1. Coding - Arrays
  {
    slug: 'two-sum',
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    difficulty: Difficulty.EASY,
    category: 'Coding',
    topic: 'Arrays',
    estimatedTime: 15,
    companies: ['Google', 'Amazon', 'Facebook', 'Apple'],
  },
  {
    slug: 'container-with-most-water',
    title: 'Container With Most Water',
    description: 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.',
    difficulty: Difficulty.MEDIUM,
    category: 'Coding',
    topic: 'Arrays',
    estimatedTime: 25,
    companies: ['Amazon', 'Google', 'Adobe'],
  },
  // 2. Coding - Strings
  {
    slug: 'valid-anagram',
    title: 'Valid Anagram',
    description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
    difficulty: Difficulty.EASY,
    category: 'Coding',
    topic: 'Strings',
    estimatedTime: 10,
    companies: ['Uber', 'Facebook', 'Bloomberg'],
  },
  {
    slug: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    difficulty: Difficulty.MEDIUM,
    category: 'Coding',
    topic: 'Strings',
    estimatedTime: 30,
    companies: ['Google', 'Microsoft', 'Amazon', 'Bloomberg'],
  },
  // 3. Coding - Linked Lists
  {
    slug: 'reverse-linked-list',
    title: 'Reverse Linked List',
    description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list. Can you reverse it both iteratively and recursively?',
    difficulty: Difficulty.EASY,
    category: 'Coding',
    topic: 'Linked Lists',
    estimatedTime: 15,
    companies: ['Microsoft', 'Apple', 'Adobe'],
  },
  {
    slug: 'merge-k-sorted-lists',
    title: 'Merge k Sorted Lists',
    description: 'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    difficulty: Difficulty.HARD,
    category: 'Coding',
    topic: 'Linked Lists',
    estimatedTime: 45,
    companies: ['Google', 'Amazon', 'Facebook', 'Netflix'],
  },
  // 4. Coding - Trees
  {
    slug: 'maximum-depth-of-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    description: 'Given the `root` of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    difficulty: Difficulty.EASY,
    category: 'Coding',
    topic: 'Trees',
    estimatedTime: 15,
    companies: ['LinkedIn', 'Apple', 'Spotify'],
  },
  {
    slug: 'validate-binary-search-tree',
    title: 'Validate Binary Search Tree',
    description: 'Given the `root` of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as follows:\n1. The left subtree of a node contains only nodes with keys less than the node\'s key.\n2. The right subtree of a node contains only nodes with keys greater than the node\'s key.\n3. Both the left and right subtrees must also be binary search trees.',
    difficulty: Difficulty.MEDIUM,
    category: 'Coding',
    topic: 'Trees',
    estimatedTime: 25,
    companies: ['Microsoft', 'Amazon', 'Bloomberg'],
  },
  // 5. Coding - Graphs
  {
    slug: 'number-of-islands',
    title: 'Number of Islands',
    description: 'Given an `m x n` 2D binary grid `grid` which represents a map of `\'1\'`s (land) and `\'0\'`s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.',
    difficulty: Difficulty.MEDIUM,
    category: 'Coding',
    topic: 'Graphs',
    estimatedTime: 35,
    companies: ['Google', 'Amazon', 'Uber', 'Salesforce'],
  },
  {
    slug: 'alien-dictionary',
    title: 'Alien Dictionary',
    description: 'There is a new alien language that uses the English alphabet. However, the order of the letters is unknown to you. You are given a list of strings `words` from the alien language\'s dictionary, where the words are sorted lexicographically according to the rules of this new language. Return a string of the unique letters in the new alien language sorted in lexicographically increasing order. If there is no solution, return `""`. If there are multiple solutions, return any of them.',
    difficulty: Difficulty.HARD,
    category: 'Coding',
    topic: 'Graphs',
    estimatedTime: 50,
    companies: ['Google', 'Facebook', 'Twitter', 'Pinterest'],
  },
  // 6. Coding - DP
  {
    slug: 'climbing-stairs',
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    difficulty: Difficulty.EASY,
    category: 'Coding',
    topic: 'DP',
    estimatedTime: 15,
    companies: ['Google', 'Goldman Sachs', 'Apple'],
  },
  {
    slug: 'longests-common-subsequence',
    title: 'Longest Common Subsequence',
    description: 'Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return `0`. A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.',
    difficulty: Difficulty.MEDIUM,
    category: 'Coding',
    topic: 'DP',
    estimatedTime: 35,
    companies: ['Amazon', 'Microsoft', 'Oracle'],
  },
  // 7. SQL
  {
    slug: 'duplicate-emails',
    title: 'Duplicate Emails',
    description: 'Write a SQL query to report all the duplicate emails in a table named `Person` containing fields `id` (int) and `email` (varchar).',
    difficulty: Difficulty.EASY,
    category: 'SQL',
    topic: 'SQL',
    estimatedTime: 10,
    companies: ['Amazon', 'Facebook', 'Adobe'],
  },
  {
    slug: 'department-highest-salary',
    title: 'Department Highest Salary',
    description: 'Write a SQL query to find employees who have the highest salary in each of the departments. You are given an `Employee` table (id, name, salary, departmentId) and a `Department` table (id, name).',
    difficulty: Difficulty.MEDIUM,
    category: 'SQL',
    topic: 'SQL',
    estimatedTime: 20,
    companies: ['Microsoft', 'Google', 'Uber'],
  },
  {
    slug: 'trips-and-users',
    title: 'Trips and Users',
    description: 'Write a SQL query to find the cancellation rate of requests with banned users (both client and driver must not be banned) each day between "2013-10-01" and "2013-10-03". Round cancellation rate to two decimal places.',
    difficulty: Difficulty.HARD,
    category: 'SQL',
    topic: 'SQL',
    estimatedTime: 40,
    companies: ['Uber', 'Lyft'],
  },
  // 8. Behavioral
  {
    slug: 'tell-me-about-yourself',
    title: 'Tell Me About Yourself',
    description: 'Walk me through your resume, highlighting key projects, technical accomplishments, and what led you to apply for this role.',
    difficulty: Difficulty.EASY,
    category: 'Behavioral',
    topic: 'Behavioral',
    estimatedTime: 5,
    companies: ['All Companies'],
  },
  {
    slug: 'describe-a-difficult-conflict',
    title: 'Describe a Time You Resolved a Conflict',
    description: 'Describe a situation where you had a disagreement with a team member, how you approached the discussion, and the ultimate resolution. Focus on positive conflict management skills.',
    difficulty: Difficulty.MEDIUM,
    category: 'Behavioral',
    topic: 'Behavioral',
    estimatedTime: 10,
    companies: ['Amazon', 'Microsoft', 'Google', 'Netflix'],
  },
  {
    slug: 'time-you-failed',
    title: 'Tell Me About a Time You Failed',
    description: 'Describe a significant failure in your career. What went wrong, what were the consequences, and what did you learn or change as a result of that experience?',
    difficulty: Difficulty.MEDIUM,
    category: 'Behavioral',
    topic: 'Behavioral',
    estimatedTime: 10,
    companies: ['Apple', 'Stripe', 'Google', 'Meta'],
  },
  // 9. System Design
  {
    slug: 'design-a-rate-limiter',
    title: 'Design a Rate Limiter',
    description: 'Design a highly available and scalable rate limiting service for an API Gateway. Discuss rate-limiting algorithms (Token Bucket, Leaky Bucket, Sliding Window Log, Sliding Window Counter), database storage models (Redis), multi-region deployments, and client integration.',
    difficulty: Difficulty.MEDIUM,
    category: 'System Design',
    topic: 'System Design',
    estimatedTime: 45,
    companies: ['Stripe', 'Uber', 'Lyft', 'Slack'],
  },
  {
    slug: 'design-url-shortener',
    title: 'Design a URL Shortening Service (TinyURL)',
    description: 'Design a URL shortener system like TinyURL. Discuss write throughput vs read throughput, hash collision handling (Base62 encoding, MD5 mapping), custom alias support, redirection latency optimization (Redis cache layers), and analytics tracking database choices.',
    difficulty: Difficulty.EASY,
    category: 'System Design',
    topic: 'System Design',
    estimatedTime: 30,
    companies: ['Twitter', 'Amazon', 'Microsoft'],
  },
  {
    slug: 'design-netflix',
    title: 'Design Video Streaming Platform (Netflix)',
    description: 'Design a scalable video streaming platform like Netflix. Discuss video upload pipelines (transcoding, compression, metadata storage), CDN caching strategies for low latency playbacks, recommendation algorithms storage, and offline download architectures.',
    difficulty: Difficulty.HARD,
    category: 'System Design',
    topic: 'System Design',
    estimatedTime: 45,
    companies: ['Netflix', 'Amazon Prime', 'YouTube', 'Hulu'],
  },
];

async function main() {
  console.log('🌱 Start seeding questions and coding problems...');
  
  // Clear existing data to support repeatable seeds
  await prisma.codingSession.deleteMany({});
  await prisma.codingProblem.deleteMany({});
  await prisma.question.deleteMany({});
  
  for (const q of questions) {
    const question = await prisma.question.create({
      data: q,
    });
    console.log(`Created question: ${question.title} (${question.slug})`);
  }

  for (const cp of codingProblems) {
    const problem = await prisma.codingProblem.create({
      data: cp,
    });
    console.log(`Created coding problem: ${problem.title} (${problem.slug})`);
  }
  
  console.log('🏁 Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
