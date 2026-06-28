import { GoogleGenAI } from '@google/genai';
import { env } from '@backend/config/env';
import { logger } from '@backend/config/logger';
import { InterviewDomain, Difficulty, CompanyProfile } from '@prisma/client';
import { z } from 'zod';
import { COMPANY_PROFILES } from '@backend/config/companyProfiles';

// Local Fallback Pool of high-quality interview questions
const FALLBACK_QUESTIONS: Record<InterviewDomain, Partial<Record<Difficulty, string[]>>> = {
  JAVA: {
    EASY: [
      'What are the main differences between abstract classes and interfaces in Java 8+?',
      'Explain the Java memory management model (Heap vs Stack).',
      'What is the purpose of the `volatile` keyword in Java?',
    ],
    MEDIUM: [
      'How does the HashMap work internally in Java 8? Explain collision resolution.',
      'Explain the ForkJoinPool and how it is used in Parallel Streams.',
      'What are Java Generics and how does type erasure affect JVM runtime?',
    ],
    HARD: [
      'Design a custom thread pool executor in Java without using the `java.util.concurrent` wrappers.',
      'How does the Garbage Collector (G1 vs ZGC) manage memory compression and stop-the-world pauses?',
      'Explain the memory visibility guarantees of the Java Memory Model (JMM) and happen-before relationships.',
    ],
  },
  PYTHON: {
    EASY: [
      'What is the difference between list comprehensions and generator expressions in Python?',
      'Explain the difference between deepcopy and shallowcopy.',
      'What is the purpose of the GIL (Global Interpreter Lock) in CPython?',
    ],
    MEDIUM: [
      'Explain Python decorators and write a custom memoization decorator.',
      'How does Python manage memory? Explain reference counting and cyclic garbage collections.',
      'What are metaclasses and how can you use them to customize class creation?',
    ],
    HARD: [
      'Implement an asynchronous task queue in Python using asyncio and custom coroutines.',
      'Explain the descriptor protocol in Python and how properties/methods leverage it.',
      'How does CPython optimize list allocation, and what are the performance complexities of dictionary resizing?',
    ],
  },
  DSA: {
    EASY: [
      'Given an array of integers, how do you find the first non-repeating character in O(n) time?',
      'Explain the differences between binary trees and binary search trees.',
      'Implement an iterative traversal of a binary tree (In-order).',
    ],
    MEDIUM: [
      'Given a directed graph, how do you detect cycles using Depth-First Search (DFS)?',
      'Implement the LRU Cache algorithm with O(1) get and put operations.',
      'Find the longest palindromic substring in a given string using dynamic programming.',
    ],
    HARD: [
      'Solve the Longest Increasing Subsequence problem in O(n log n) complexity.',
      'Explain the properties of a Red-Black Tree and how balancing rotations are performed.',
      'Implement Dijkstra\'s algorithm for shortest paths in a weighted graph using min-heaps.',
    ],
  },
  SQL: {
    EASY: [
      'What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN in SQL?',
      'Explain the purpose of indexation in SQL and how it speeds up queries.',
      'What is the difference between WHERE and HAVING clauses?',
    ],
    MEDIUM: [
      'Write a SQL query using window functions (ROW_NUMBER/DENSE_RANK) to find the top 3 highest earning employees per department.',
      'Explain query optimization strategies: how to analyze query execution plans (EXPLAIN).',
      'What are transactions? Explain ACID properties and database isolation levels (Read Committed, Repeatable Read).',
    ],
    HARD: [
      'How do databases handle concurrency control? Explain Optimistic vs Pessimistic locking.',
      'Design a database schema partition strategy for storing 50 million audit records monthly.',
      'Explain B-Trees vs LSM-Trees and how index structures affect write/read amplification.',
    ],
  },
  SYSTEM_DESIGN: {
    EASY: [
      'Explain horizontal scaling vs vertical scaling. What are the key limitations of each?',
      'What is DNS and how does CDN caching help reduce global latency?',
      'Explain load balancing algorithms (Round Robin, Least Connections, Consistent Hashing).',
    ],
    MEDIUM: [
      'Design a notification system capable of sending millions of real-time push alerts, emails, and SMS daily.',
      'Explain SQL vs NoSQL. When would you prefer a document store (MongoDB) over a relational database?',
      'Design a web crawler that runs concurrently and respects robots.txt directives.',
    ],
    HARD: [
      'Design a highly available and globally distributed chat system like WhatsApp. Discuss synchronization, message delivery guarantees, and connection scaling.',
      'Explain CAP Theorem and PACELC theorem. How do you design system storage models for high availability vs strict consistency?',
      'Design a distributed rate limiter that operates across multiple server nodes using Redis clusters.',
    ],
  },
  BEHAVIORAL: {
    EASY: [
      'Tell me about a project you are proud of. What was your contribution and what technologies did you choose?',
      'How do you manage deadlines and prioritize tasks when working under pressure?',
      'Describe a situation where you had to learn a new tool or language quickly.',
    ],
    MEDIUM: [
      'Describe a time you had a disagreement with a technical lead or manager. How did you resolve the conflict?',
      'Tell me about a time you made a significant mistake. What went wrong and what did you learn?',
      'How do you handle technical debt? Describe a time you advocated for refactoring legacy code.',
    ],
    HARD: [
      'Describe a time you had to make a critical architectural decision under tight deadlines and incomplete requirements.',
      'Tell me about a time you mentored a junior engineer or helped team members improve their coding practices.',
      'Describe a time you had to coordinate with cross-functional teams (PMs, QA, Devs) to deliver a high-stakes project.',
    ],
  },
  FRONTEND: {
    EASY: [
      'What is the Virtual DOM and how does React optimize component re-renders?',
      'Explain CSS specificity and how box-sizing affects layouts.',
      'What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?',
    ],
    MEDIUM: [
      'Explain React performance optimization techniques (useMemo, useCallback, React.memo, code splitting).',
      'How do you manage global states in modern web apps? Compare Context API vs Redux/Zustand.',
      'Explain web security vectors (XSS, CSRF, CORS) and how to mitigate them in frontend code.',
    ],
    HARD: [
      'Design a high-performance infinite scroll component in React that handles 10,000+ dynamic items with virtual DOM rendering.',
      'Explain the browser rendering engine workflow (HTML parsing, CSSOM, layout, paint, composite) and how to diagnose layout thrashing.',
      'Build a custom micro-frontend architecture shell that shares state modules across sandboxed packages.',
    ],
  },
  BACKEND: {
    EASY: [
      'What is the difference between monolithic architectures and microservices?',
      'Explain REST API design principles and how to use standard HTTP status codes.',
      'What is connection pooling and why is it essential for backend databases?',
    ],
    MEDIUM: [
      'Design a background job queuing system in Node.js using BullMQ and Redis for processing email queues.',
      'How do you manage session authentications? Contrast JWT tokens vs server-stored cookie sessions.',
      'Explain message queues (RabbitMQ/Kafka) and describe when you would choose asynchronous message-passing over synchronous HTTP.',
    ],
    HARD: [
      'Design a backend gateway system that coordinates request rate-limiting, authentication checks, dynamic routing, and telemetry logging.',
      'Explain how NodeJS event loops work. How do you handle CPU-bound tasks in Node to prevent event loop blocking?',
      'Design a horizontal database scaling strategy using sharding and write-ahead logs (WAL).',
    ],
  },
  FULL_STACK: {
    EASY: [
      'Explain the complete client-server request cycle when fetching an image resource from a URL.',
      'How does HTTPS establish a secure session between browser client and server?',
      'What is the difference between local storage, session storage, and cookies?',
    ],
    MEDIUM: [
      'Design an e-commerce shopping cart system. How do you coordinate state between the client UI and database tables?',
      'Explain the purpose of server-side caching (Redis) and how cache invalidation strategies operate.',
      'Design a file uploading system supporting large media assets, progressive encoders, and S3 buckets.',
    ],
    HARD: [
      'Design a real-time collaborative code editor like Google Docs. Discuss WebSocket connections, Operational Transformations (OT), and database synchronization.',
      'Explain server-sent events (SSE) vs WebSockets and design an active notifications dashboard.',
      'Build a continuous integration/deployment pipeline (CI/CD) that compiles TS, runs tests, and packages docker containers to staging.',
    ],
  },
};

/**
 * Service to interface with Google Gemini API to generate interview questions.
 */
export const generateQuestions = async (
  domain: InterviewDomain,
  difficulty: Difficulty,
  companyProfile?: CompanyProfile | null
): Promise<string[]> => {
  const companyConfig = companyProfile ? COMPANY_PROFILES[companyProfile] : null;

  // Check if API key is present
  if (!env.GEMINI_API_KEY) {
    logger.info(`🔑 GEMINI_API_KEY not configured. Falling back to local questions pool for ${domain} (${difficulty}).`);
    if (companyConfig) {
      return [
        `Explain how you would design and implement a system addressing ${companyConfig.fallbackQuestionThemes[0]} in a ${domain} context at ${companyConfig.name}.`,
        `How do you handle scalability and perform ${companyConfig.fallbackQuestionThemes[1]} for ${domain} platforms?`,
        `Describe how you would approach a complex problem regarding ${companyConfig.fallbackQuestionThemes[2]} under a ${difficulty} scenario.`,
        `In the context of ${companyConfig.name}'s engineering practices, how would you design a service that handles ${companyConfig.fallbackQuestionThemes[3]}?`
      ];
    }
    let diffKey = difficulty;
    if (diffKey === 'EASY_MEDIUM') diffKey = 'MEDIUM';
    if (diffKey === 'MEDIUM_HARD') diffKey = 'HARD';
    return FALLBACK_QUESTIONS[domain]?.[diffKey] || ['Question 1', 'Question 2', 'Question 3'];
  }

  try {
    // Correct usage of GoogleGenAI SDK
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    
    let prompt = `You are a professional software engineering interviewer. 
    Generate 4 distinct, challenging, and realistic interview questions for a ${difficulty} difficulty ${domain} interview. 
    Return your response strictly as a JSON array of strings, containing only the questions. E.g. ["Question 1", "Question 2"]. Do not wrap in markdown tags like \`\`\`json.`;

    if (companyConfig) {
      prompt = `You are a professional software engineering interviewer at ${companyConfig.name}. 
      Generate 4 distinct, challenging, and realistic interview questions for a ${difficulty} difficulty ${domain} interview, specifically tailored to the company's interview style and focus areas: ${companyConfig.focusAreas.join(', ')}.
      Return your response strictly as a JSON array of strings, containing only the questions. E.g. ["Question 1", "Question 2"]. Do not wrap in markdown tags like \`\`\`json.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();

    if (!text) {
      throw new Error('Gemini returned empty text');
    }

    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      // Validate length: min 3, max 10
      if (parsed.length >= 3 && parsed.length <= 10) {
        return parsed.map((item: any) => String(item));
      } else {
        logger.warn(`⚠️ Gemini returned invalid question count: ${parsed.length}. Falling back.`);
      }
    } else {
      logger.warn('⚠️ Gemini did not return a JSON array. Falling back.');
    }
  } catch (error: any) {
    logger.error(`💥 Gemini API question generation failed: ${error.message}. Falling back.`);
  }

  if (companyConfig) {
    return [
      `Explain how you would design and implement a system addressing ${companyConfig.fallbackQuestionThemes[0]} in a ${domain} context at ${companyConfig.name}.`,
      `How do you handle scalability and perform ${companyConfig.fallbackQuestionThemes[1]} for ${domain} platforms?`,
      `Describe how you would approach a complex problem regarding ${companyConfig.fallbackQuestionThemes[2]} under a ${difficulty} scenario.`,
      `In the context of ${companyConfig.name}'s engineering practices, how would you design a service that handles ${companyConfig.fallbackQuestionThemes[3]}?`
    ];
  }
  let diffKey = difficulty;
  if (diffKey === 'EASY_MEDIUM') diffKey = 'MEDIUM';
  if (diffKey === 'MEDIUM_HARD') diffKey = 'HARD';
  return FALLBACK_QUESTIONS[domain]?.[diffKey] || ['Question 1', 'Question 2', 'Question 3'];
};

// Zod schema to validate Gemini output
export const questionEvaluationSchema = z.object({
  questionId: z.string().uuid(),
  score: z.number().int().min(0).max(100),
  feedback: z.string(),
});

export const geminiEvaluationSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  technicalAccuracy: z.number().int().min(0).max(100),
  communication: z.number().int().min(0).max(100),
  clarity: z.number().int().min(0).max(100),
  depth: z.number().int().min(0).max(100),
  strengths: z.string(),
  weaknesses: z.string(),
  recommendations: z.string(),
  questionEvaluations: z.array(questionEvaluationSchema),
  companyStrengths: z.array(z.string()).optional(),
  companyWeaknesses: z.array(z.string()).optional(),
  companyRecommendations: z.array(z.string()).optional(),
});

export type GeminiEvaluation = z.infer<typeof geminiEvaluationSchema>;

export interface TranscriptItem {
  id: string; // The InterviewQuestion ID
  questionText: string;
  userAnswer: string;
}

export const getOfflineCompanyFeedback = (companyProfile: CompanyProfile | null | undefined) => {
  if (!companyProfile) return {};
  const config = COMPANY_PROFILES[companyProfile];
  if (!config) return {};
  return {
    companyStrengths: [
      `Demonstrated basic understanding of ${config.name}'s focus area: ${config.focusAreas[0]}.`,
      `Communication aligned well with the ${config.evaluationPillars[1]} pillar expectations.`
    ],
    companyWeaknesses: [
      `Need to show stronger skills in ${config.focusAreas[1] || 'design decisions'}.`,
      `Answers lacked detailed tradeoffs expected for the ${config.evaluationPillars[2] || 'execution'} assessment.`
    ],
    companyRecommendations: [
      `Practice scenarios aligned with: ${config.recommendationCategories[0]}.`,
      `Elaborate on decisions by highlighting ${config.recommendationCategories[1] || 'tradeoffs'}.`
    ]
  };
};

export const evaluateSession = async (
  domain: InterviewDomain,
  difficulty: Difficulty,
  transcript: TranscriptItem[],
  companyProfile?: CompanyProfile | null
): Promise<GeminiEvaluation> => {
  const companyConfig = companyProfile ? COMPANY_PROFILES[companyProfile] : null;

  // If no Gemini API Key is present, return a mocked evaluation
  if (!env.GEMINI_API_KEY) {
    logger.info(`🔑 GEMINI_API_KEY not configured. Generating offline mock evaluation.`);
    // Calculate a mock score based on answered questions
    const answeredCount = transcript.filter((t) => t.userAnswer.trim().length > 0).length;
    const totalCount = transcript.length;
    const baseScore = totalCount > 0 ? Math.round((answeredCount / totalCount) * 80) + 15 : 70; // 15 to 95 scale
    
    const parsedMock = {
      overallScore: baseScore,
      technicalAccuracy: Math.max(10, baseScore - Math.floor(Math.random() * 10)),
      communication: Math.max(10, baseScore + Math.floor(Math.random() * 5)),
      clarity: Math.max(10, baseScore - Math.floor(Math.random() * 5)),
      depth: Math.max(10, baseScore - Math.floor(Math.random() * 8)),
      strengths: `• Demonstrated basic understanding of ${domain} concepts.\n• Provided direct answers to ${answeredCount} out of ${totalCount} questions.\n• Code structure/logic explanation was present in submitted answers.`,
      weaknesses: `• Some answers lack depth or specific technical specifications.\n• Did not expand on architectural tradeoffs or scale limitations.\n• ${totalCount - answeredCount} questions were left blank.`,
      recommendations: `• Study design patterns relevant to ${domain}.\n• Practice writing modular code under time constraints.\n• Ensure every answer includes clear tradeoffs and performance parameters.`,
      questionEvaluations: transcript.map((item) => ({
        questionId: item.id,
        score: item.userAnswer.trim().length > 0 ? Math.round(Math.random() * 30) + 65 : 0,
        feedback: item.userAnswer.trim().length > 0 
          ? `Good initial answer, but could be improved with more deep technical detail.` 
          : `No answer was provided for this question.`,
      })),
      ...getOfflineCompanyFeedback(companyProfile)
    };

    // Validate using Zod to ensure consistency
    return geminiEvaluationSchema.parse(parsedMock);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    // Build the transcript text for the prompt
    const transcriptText = transcript.map((item, idx) => {
      return `Question ${idx + 1} (ID: ${item.id}):
Question: ${item.questionText}
Candidate Answer: ${item.userAnswer || '[No response provided/skipped]'}`;
    }).join('\n\n');

    let companyPillarPrompt = '';
    let jsonCompanyFieldsSchema = '';
    let jsonCompanyFieldsExample = '';

    if (companyConfig) {
      companyPillarPrompt = `
      Because this is a mock interview targeted for ${companyConfig.name}, you MUST evaluate the candidate's answers against the following company-specific evaluation pillars: ${companyConfig.evaluationPillars.join(', ')}.
      In addition to the standard JSON fields, you MUST include the following three fields in the JSON response:
      - companyStrengths: array of strings containing bullet points of how the candidate demonstrated ${companyConfig.name}'s values.
      - companyWeaknesses: array of strings containing bullet points of where the candidate fell short of ${companyConfig.name}'s values.
      - companyRecommendations: array of strings containing specific actionable recommendations to align with ${companyConfig.name}'s hiring bar.
      `;
      jsonCompanyFieldsSchema = `
      "companyStrengths": string[],
      "companyWeaknesses": string[],
      "companyRecommendations": string[],`;
      jsonCompanyFieldsExample = `
      "companyStrengths": ["Showed bias for action", "Took customer feedback into account"],
      "companyWeaknesses": ["Lacked deep ownership explanation"],
      "companyRecommendations": ["Practice structure answering using Amazon Leadership principles"],`;
    }

    const prompt = `You are a professional software engineering interviewer and technical assessor. 
    Evaluate the following interview transcript for a ${difficulty} difficulty ${domain} interview.${companyPillarPrompt}
    
    TRANSCRIPT:
    ${transcriptText}
    
    Please evaluate the candidate's responses on these criteria:
    - overallScore: integer from 0 to 100 representing the overall assessment.
    - technicalAccuracy: integer from 0 to 100 representing accuracy of technical concepts/code.
    - communication: integer from 0 to 100 representing communication clarity and structured thought.
    - clarity: integer from 0 to 100 representing readability/conciseness of answers.
    - depth: integer from 0 to 100 representing detailed knowledge/tradeoff analysis.
    
    Constructive feedback:
    - strengths: string (markdown format with bullet points)
    - weaknesses: string (markdown format with bullet points)
    - recommendations: string (markdown format with bullet points)
    
    Question evaluations:
    - For each question in the transcript, evaluate and provide:
      - questionId: the EXACT UUID of the question from the transcript (important: do not change or invent this UUID).
      - score: integer from 0 to 100.
      - feedback: string explaining why this score was given.
      
    You MUST return your response strictly as a JSON object matching this TypeScript structure:
    {
      "overallScore": number,
      "technicalAccuracy": number,
      "communication": number,
      "clarity": number,
      "depth": number,
      "strengths": string,
      "weaknesses": string,
      "recommendations": string,${jsonCompanyFieldsSchema}
      "questionEvaluations": [
        {
          "questionId": string,
          "score": number,
          "feedback": string
        }
      ]
    }
    
    Do not wrap your response in markdown code blocks like \`\`\`json. Do not include any text other than the JSON object. Example JSON structure:
    {
      "overallScore": 75,
      "technicalAccuracy": 80,
      "communication": 70,
      "clarity": 75,
      "depth": 70,
      "strengths": "Good concepts",
      "weaknesses": "Code speed",
      "recommendations": "Practice speed",${jsonCompanyFieldsExample}
      "questionEvaluations": [
        {
          "questionId": "${transcript[0]?.id || 'uuid'}",
          "score": 75,
          "feedback": "Correct base logic"
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Gemini returned empty evaluation response');
    }

    const parsed = JSON.parse(text);

    // Validate using Zod
    const validated = geminiEvaluationSchema.parse(parsed);
    return validated;
  } catch (error: any) {
    logger.error(`💥 Gemini evaluation failed: ${error.message}`);
    throw error;
  }
};

export const generateOfflinePersonalizedQuestions = (
  parsedResume: any,
  domain: InterviewDomain,
  difficulty: Difficulty,
  companyProfile?: CompanyProfile | null
): string[] => {
  const companyConfig = companyProfile ? COMPANY_PROFILES[companyProfile] : null;
  const skills = parsedResume?.skills || parsedResume?.technologies || [];
  const projects = parsedResume?.projects || [];
  const experience = parsedResume?.experience || [];

  const questions: string[] = [];

  if (companyConfig) {
    // 1. Question about project combining company focus
    if (projects.length > 0) {
      questions.push(`Your resume mentions the project "${projects[0].title || projects[0].name}". In the context of ${companyConfig.name}'s focus on ${companyConfig.focusAreas[0]}, how did you design this system and address key engineering tradeoffs?`);
    } else if (experience.length > 0) {
      questions.push(`At ${experience[0].company || 'your past role'}, you worked as a ${experience[0].role || 'Software Engineer'}. Tell me about a time you demonstrated ${companyConfig.evaluationPillars[0] || 'leadership'} or ownership while deploying code.`);
    } else {
      questions.push(`Can you explain a complex project you worked on, and how you would architecture it at ${companyConfig.name} to optimize for ${companyConfig.focusAreas[0]}?`);
    }

    // 2. Question about skills matching company focus
    if (skills.length > 0) {
      questions.push(`You listed "${skills[0]}" as a core skill. For a ${difficulty} difficulty scenario, how would you apply "${skills[0]}" to solve challenges around ${companyConfig.focusAreas[1] || 'design patterns'}?`);
    } else {
      questions.push(`How do you approach system optimization and design tradeoffs for ${companyConfig.focusAreas[1] || 'software design'}?`);
    }

    // 3. Question about experience or design matching company principles
    if (experience.length > 0) {
      questions.push(`At ${experience[0].company || 'your past role'}, how did you apply core principles of ${companyConfig.name} (like ${companyConfig.evaluationPillars[1] || 'bias for action'}) to resolve technical bottlenecks?`);
    } else {
      questions.push(`Describe a time you faced a complex debugging or delivery challenge and how you solved it applying principles of ${companyConfig.evaluationPillars[1] || 'bias for action'}.`);
    }

    // 4. Scenario in the domain matching company theme
    const skillText = skills.slice(0, 3).join(', ') || 'modern stacks';
    questions.push(`Considering your experience with ${skillText}, design a scalable ${domain} solution for ${companyConfig.name} that handles ${companyConfig.fallbackQuestionThemes[0]}.`);

    return questions;
  }

  // Question 1: Focused on a specific project or experience
  if (projects.length > 0) {
    const proj = projects[0];
    questions.push(`Your resume mentions the project "${proj.title || proj.name}". What technical challenges did you face while building it, and how did you resolve them?`);
  } else if (experience.length > 0) {
    const exp = experience[0];
    questions.push(`At ${exp.company || 'your previous role'}, you worked as a ${exp.role || 'Software Engineer'}. Can you explain a complex technical challenge you faced there and how you overcame it?`);
  } else {
    questions.push(`Can you explain a complex project you worked on recently, detailing the system architecture and key design decisions?`);
  }

  // Question 2: Focused on design decisions and tradeoffs of a claimed skill
  if (skills.length > 0) {
    const skill = skills[0];
    let diffKey = difficulty;
    if (diffKey === 'EASY_MEDIUM') diffKey = 'MEDIUM';
    if (diffKey === 'MEDIUM_HARD') diffKey = 'HARD';
    questions.push(`You listed "${skill}" as one of your core skills. For a ${diffKey} difficulty scenario, what are the primary architectural tradeoffs of using "${skill}" over alternative solutions?`);
  } else {
    questions.push(`In your technical projects, what architectural tradeoffs did you make to optimize performance and reliability under resource constraints?`);
  }

  // Question 3: Focused on scalability or caching or standard domain question customized with skills
  if (skills.length > 1) {
    const skill = skills[1];
    questions.push(`Explain how you would design a system to scale horizontally when integrating with "${skill}". What issues around concurrency or caching would you anticipate?`);
  } else {
    questions.push(`How do you handle system bottlenecks and data synchronization in a distributed architecture under high load?`);
  }

  // Question 4: Domain specific challenge referencing skills
  const skillText = skills.slice(0, 3).join(', ') || 'modern frameworks';
  questions.push(`Considering your experience with ${skillText}, how do you approach debugging memory leaks, connection pools, or security vulnerabilities in a ${domain} context?`);

  return questions;
};

export const generatePersonalizedQuestions = async (
  resumeText: string,
  parsedResume: any,
  domain: InterviewDomain,
  difficulty: Difficulty,
  companyProfile?: CompanyProfile | null
): Promise<string[]> => {
  if (!env.GEMINI_API_KEY) {
    logger.info(`🔑 GEMINI_API_KEY not configured. Falling back to local deterministic personalized questions.`);
    return generateOfflinePersonalizedQuestions(parsedResume, domain, difficulty, companyProfile);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    
    const skills = parsedResume?.skills || [];
    const projects = parsedResume?.projects || [];
    const experience = parsedResume?.experience || [];

    const companyConfig = companyProfile ? COMPANY_PROFILES[companyProfile] : null;
    let prompt = `You are a professional software engineering interviewer.
    Generate 4 distinct, challenging, and realistic interview questions customized for a candidate based on their resume and targeted for a ${difficulty} difficulty ${domain} interview.
    
    CANDIDATE RESUME DETAILS:
    - Skills: ${JSON.stringify(skills)}
    - Projects: ${JSON.stringify(projects)}
    - Experience: ${JSON.stringify(experience)}
    - Raw Resume Text:
    ${resumeText.slice(0, 4000)}
    
    You MUST tailor the questions specifically around:
    1. A project listed on their resume, asking about system architecture, challenges, or design choices.
    2. A technology/skill they claimed, testing depth of knowledge and tradeoffs.
    3. A design decision or tradeoff made during their past experience.
    4. A challenging scenario in the ${domain} domain requiring integration of their technical skills.
    
    Return your response strictly as a JSON array of strings, containing only the questions. E.g. ["Question 1", "Question 2"]. Do not wrap in markdown tags like \`\`\`json.`;

    if (companyConfig) {
      prompt = `You are a professional software engineering interviewer at ${companyConfig.name}.
      Generate 4 distinct, challenging, and realistic interview questions customized for a candidate based on their resume and targeted for a ${difficulty} difficulty ${domain} interview, specifically matching the engineering expectations and focus areas of ${companyConfig.name} (${companyConfig.focusAreas.join(', ')}).
      
      CANDIDATE RESUME DETAILS:
      - Skills: ${JSON.stringify(skills)}
      - Projects: ${JSON.stringify(projects)}
      - Experience: ${JSON.stringify(experience)}
      - Raw Resume Text:
      ${resumeText.slice(0, 4000)}
      
      You MUST tailor the questions specifically around:
      1. A project listed on their resume, asking about system architecture, challenges, or design choices, framed in the style of ${companyConfig.name}'s focus on ${companyConfig.focusAreas[0]}.
      2. A technology/skill they claimed, testing depth of knowledge and tradeoffs, matching the engineering principles of ${companyConfig.name}.
      3. A design decision or tradeoff made during their past experience, evaluated from the perspective of ${companyConfig.name}'s focus on ${companyConfig.focusAreas[1] || 'scalability'}.
      4. A challenging scenario in the ${domain} domain requiring integration of their technical skills, aligning with how ${companyConfig.name} designs systems for ${companyConfig.focusAreas[2] || 'high availability'}.
      
      Return your response strictly as a JSON array of strings, containing only the questions. E.g. ["Question 1", "Question 2"]. Do not wrap in markdown tags like \`\`\`json.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) throw new Error('Gemini returned empty text');
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length >= 3 && parsed.length <= 10) {
      return parsed.map((item: any) => String(item));
    }
  } catch (error: any) {
    logger.error(`💥 Gemini personalized question generation failed: ${error.message}. Falling back.`);
  }
  return generateOfflinePersonalizedQuestions(parsedResume, domain, difficulty, companyProfile);
};

export const personalizedEvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  technicalAccuracy: z.number().min(0).max(100),
  communication: z.number().min(0).max(100),
  clarity: z.number().min(0).max(100),
  depth: z.number().min(0).max(100),
  resumeAlignmentScore: z.number().min(0).max(100),
  consistencyScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  strengths: z.string(),
  weaknesses: z.string(),
  recommendations: z.string(),
  strongestClaimedSkill: z.string(),
  weakestClaimedSkill: z.string(),
  mostConvincingProjectDiscussion: z.string(),
  skillsRequiringVerification: z.array(z.string()),
  questionEvaluations: z.array(questionEvaluationSchema),
  companyStrengths: z.array(z.string()).optional(),
  companyWeaknesses: z.array(z.string()).optional(),
  companyRecommendations: z.array(z.string()).optional(),
});

export type GeminiPersonalizedEvaluation = z.infer<typeof personalizedEvaluationSchema>;

export const evaluatePersonalizedInterviewOffline = (
  domain: InterviewDomain,
  difficulty: Difficulty,
  transcript: TranscriptItem[],
  parsedResume: any,
  companyProfile?: CompanyProfile | null
): GeminiPersonalizedEvaluation => {
  const resumeSkills = parsedResume?.skills || parsedResume?.technologies || [];
  
  let answeredCount = 0;
  let totalLength = 0;
  let matchesResumeSkill = 0;

  const normalizedSkills = resumeSkills.map((s: string) => s.toLowerCase().trim());

  transcript.forEach((item) => {
    const ans = item.userAnswer.trim();
    if (ans.length > 0) {
      answeredCount++;
      totalLength += ans.length;
      
      const ansLower = ans.toLowerCase();
      const matched = normalizedSkills.some((skill: string) => {
        const escaped = skill.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const startBoundary = /^\w/.test(skill) ? '\\b' : '';
        const endBoundary = /\w$/.test(skill) ? '\\b' : '(?![\\w])';
        const regex = new RegExp(`${startBoundary}${escaped}${endBoundary}`, 'i');
        return regex.test(ansLower);
      });
      if (matched) {
        matchesResumeSkill++;
      }
    }
  });

  const totalCount = transcript.length || 1;
  const answerRatio = answeredCount / totalCount;
  
  const baseScore = Math.round(answerRatio * 75) + 15;
  
  let resumeAlignmentScore = 50;
  if (answeredCount > 0) {
    resumeAlignmentScore = Math.round((matchesResumeSkill / answeredCount) * 40) + 55;
  }
  
  let consistencyScore = 90 - (totalCount - answeredCount) * 15;
  transcript.forEach((item) => {
    const ans = item.userAnswer.trim();
    if (ans.length > 0 && ans.length < 20) {
      consistencyScore -= 10;
    }
  });
  consistencyScore = Math.max(10, Math.min(100, consistencyScore));

  const avgLength = answeredCount > 0 ? totalLength / answeredCount : 0;
  let confidenceScore = Math.round(Math.min(avgLength / 5, 40) + (consistencyScore * 0.6));
  confidenceScore = Math.max(10, Math.min(100, confidenceScore));

  const strongestClaimedSkill = resumeSkills[0] || 'Problem Solving';
  const weakestClaimedSkill = resumeSkills[resumeSkills.length - 1] || 'Legacy Code Refactoring';
  
  const projects = parsedResume?.projects || [];
  const mostConvincingProjectDiscussion = projects.length > 0
    ? `The candidate provided credible details aligning with their work on "${projects[0].title || projects[0].name}".`
    : `The candidate explained system architectures that align generally with the experience listed on their resume.`;

  const matchedSkillsSet = new Set<string>();
  transcript.forEach((item) => {
    const ansLower = item.userAnswer.toLowerCase();
    normalizedSkills.forEach((skill: string, idx: number) => {
      if (ansLower.includes(skill)) {
        matchedSkillsSet.add(resumeSkills[idx]);
      }
    });
  });

  const skillsRequiringVerification = resumeSkills.filter((s: string) => !matchedSkillsSet.has(s)).slice(0, 3);
  if (skillsRequiringVerification.length === 0 && resumeSkills.length > 0) {
    skillsRequiringVerification.push(resumeSkills[resumeSkills.length - 1]);
  } else if (skillsRequiringVerification.length === 0) {
    skillsRequiringVerification.push('System Architecture', 'Testing');
  }

  const questionEvaluations = transcript.map((item) => {
    const ans = item.userAnswer.trim();
    let score = 0;
    let feedback = '';

    if (ans.length === 0) {
      score = 0;
      feedback = 'No response was provided for this personalized question.';
    } else {
      score = Math.round(Math.random() * 20) + 65;
      feedback = 'Answer aligned with resume technologies. Good structure, but could expand further on design tradeoffs.';
      if (ans.length < 20) {
        score = Math.max(20, score - 30);
        feedback = 'Response is too brief to demonstrate deep technical understanding of the claimed technologies.';
      }
    }

    return {
      questionId: item.id,
      score,
      feedback,
    };
  });

  return {
    overallScore: baseScore,
    technicalAccuracy: Math.max(10, baseScore - 5),
    communication: Math.max(10, baseScore + 5),
    clarity: Math.max(10, baseScore),
    depth: Math.max(10, Math.round(baseScore * 0.9)),
    resumeAlignmentScore,
    consistencyScore,
    confidenceScore,
    strengths: `• Demonstrates familiarity with key resume skills like ${strongestClaimedSkill}.\n• Direct mapping of project challenges in mock answers.\n• Good basic coding terminology usage.`,
    weaknesses: `• Short response lengths indicate potential gaps in core depth.\n• Lacks extensive breakdown of alternative technology tradeoffs.\n• ${totalCount - answeredCount} questions were skipped.`,
    recommendations: `• Practice elaborating on architecture design decisions.\n• Review core theoretical concepts of ${weakestClaimedSkill}.\n• Complete mock runs with detailed structured examples (Situation-Task-Action-Result).`,
    strongestClaimedSkill,
    weakestClaimedSkill,
    mostConvincingProjectDiscussion,
    skillsRequiringVerification,
    questionEvaluations,
    ...getOfflineCompanyFeedback(companyProfile)
  };
};

export const evaluatePersonalizedInterview = async (
  domain: InterviewDomain,
  difficulty: Difficulty,
  transcript: TranscriptItem[],
  resumeText: string,
  parsedResume: any,
  companyProfile?: CompanyProfile | null
): Promise<GeminiPersonalizedEvaluation> => {
  if (!env.GEMINI_API_KEY) {
    logger.info(`🔑 GEMINI_API_KEY not configured. Generating offline mock personalized evaluation.`);
    return evaluatePersonalizedInterviewOffline(domain, difficulty, transcript, parsedResume, companyProfile);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const transcriptText = transcript.map((item, idx) => {
      return `Question ${idx + 1} (ID: ${item.id}):
Question: ${item.questionText}
Candidate Answer: ${item.userAnswer || '[No response provided/skipped]'}`;
    }).join('\n\n');

    const companyConfig = companyProfile ? COMPANY_PROFILES[companyProfile] : null;
    let companyPillarPrompt = '';
    let jsonCompanyFieldsSchema = '';
    let jsonCompanyFieldsExample = '';

    if (companyConfig) {
      companyPillarPrompt = `
      Because this is a mock interview targeted for ${companyConfig.name}, you MUST evaluate the candidate's answers against the following company-specific evaluation pillars: ${companyConfig.evaluationPillars.join(', ')}.
      In addition to the standard JSON fields, you MUST include the following three fields in the JSON response:
      - companyStrengths: array of strings containing bullet points of how the candidate demonstrated ${companyConfig.name}'s values.
      - companyWeaknesses: array of strings containing bullet points of where the candidate fell short of ${companyConfig.name}'s values.
      - companyRecommendations: array of strings containing specific actionable recommendations to align with ${companyConfig.name}'s hiring bar.
      `;
      jsonCompanyFieldsSchema = `
      "companyStrengths": string[],
      "companyWeaknesses": string[],
      "companyRecommendations": string[],`;
      jsonCompanyFieldsExample = `
      "companyStrengths": ["Showed bias for action in news feed design", "Considered customer latency goals"],
      "companyWeaknesses": ["Lacked deep scalability detail on databases"],
      "companyRecommendations": ["Practice writing decoupled modules matching scale expectations"],`;
    }

    const prompt = `You are a professional software engineering interviewer and technical assessor.
    Evaluate the following personalized interview transcript against the candidate's resume.${companyPillarPrompt}
    
    CANDIDATE RESUME DETAILS:
    - Skills: ${JSON.stringify(parsedResume?.skills || [])}
    - Projects: ${JSON.stringify(parsedResume?.projects || [])}
    - Raw Resume Text:
    ${resumeText.slice(0, 4000)}
    
    TRANSCRIPT:
    ${transcriptText}
    
    Please evaluate the candidate's responses on these criteria:
    - overallScore: integer from 0 to 100 representing the overall assessment.
    - technicalAccuracy: integer from 0 to 100 representing accuracy of technical concepts/code.
    - communication: integer from 0 to 100 representing communication clarity and structured thought.
    - clarity: integer from 0 to 100 representing readability/conciseness of answers.
    - depth: integer from 0 to 100 representing detailed knowledge/tradeoff analysis.
    - resumeAlignmentScore: integer from 0 to 100 measuring how well the candidate's answers reflect the skills/projects claimed on their resume.
    - consistencyScore: integer from 0 to 100. IMPORTANT: Verify if candidate claims technologies (like Redis, Docker, Kubernetes) on their resume but cannot explain them or answers incorrectly in their responses. Reduce the consistency score for each claim that is unverified or contradicted.
    - confidenceScore: integer from 0 to 100 reflecting the credibility of their claims based on the depth of their project discussions.
    
    Constructive feedback:
    - strengths: string (markdown format with bullet points)
    - weaknesses: string (markdown format with bullet points)
    - recommendations: string (markdown format with bullet points)
    
    Tailored Insights:
    - strongestClaimedSkill: string (the technical skill they proved they know best)
    - weakestClaimedSkill: string (the claimed skill they showed least proficiency or depth in)
    - mostConvincingProjectDiscussion: string (details on which project discussion was most credible)
    - skillsRequiringVerification: array of strings (skills listed on resume that remain unverified or suspect based on responses)
    
    Question evaluations:
    - For each question in the transcript, evaluate and provide:
      - questionId: the EXACT UUID of the question from the transcript (do not change or invent this UUID).
      - score: integer from 0 to 100.
      - feedback: string explaining why this score was given.
      
    You MUST return your response strictly as a JSON object matching this TypeScript structure:
    {
      "overallScore": number,
      "technicalAccuracy": number,
      "communication": number,
      "clarity": number,
      "depth": number,
      "resumeAlignmentScore": number,
      "consistencyScore": number,
      "confidenceScore": number,
      "strengths": string,
      "weaknesses": string,
      "recommendations": string,
      "strongestClaimedSkill": string,
      "weakestClaimedSkill": string,
      "mostConvincingProjectDiscussion": string,
      "skillsRequiringVerification": string[],${jsonCompanyFieldsSchema}
      "questionEvaluations": [
        {
          "questionId": string,
          "score": number,
          "feedback": string
        }
      ]
    }
    
    Do not wrap your response in markdown code blocks like \`\`\`json. Do not include any text other than the JSON object. Example structure:
    {
      "overallScore": 75,
      "technicalAccuracy": 80,
      "communication": 70,
      "clarity": 75,
      "depth": 70,
      "resumeAlignmentScore": 85,
      "consistencyScore": 90,
      "confidenceScore": 80,
      "strengths": "Good concepts",
      "weaknesses": "Code speed",
      "recommendations": "Practice speed",
      "strongestClaimedSkill": "React",
      "weakestClaimedSkill": "TypeScript",
      "mostConvincingProjectDiscussion": "Ecommerce discussion was solid",
      "skillsRequiringVerification": ["Node.js"],${jsonCompanyFieldsExample}
      "questionEvaluations": [
        {
          "questionId": "${transcript[0]?.id || 'uuid'}",
          "score": 75,
          "feedback": "Correct base logic"
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) throw new Error('Gemini returned empty evaluation response');
    const parsed = JSON.parse(text);
    return personalizedEvaluationSchema.parse(parsed);
  } catch (error: any) {
    logger.error(`💥 Gemini personalized evaluation failed: ${error.message}. Falling back.`);
    return evaluatePersonalizedInterviewOffline(domain, difficulty, transcript, parsedResume, companyProfile);
  }
};

export const codingEvaluationResultSchema = z.object({
  correctnessScore: z.number().int().min(0).max(100),
  codeQualityScore: z.number().int().min(0).max(100),
  complexityScore: z.number().int().min(0).max(100),
  optimizationScore: z.number().int().min(0).max(100),
  strengths: z.string(),
  weaknesses: z.string(),
  recommendations: z.string(),
  similarityScore: z.number().min(0).max(100).optional(),
});

export const evaluateCodingSession = async (
  title: string,
  description: string,
  language: string,
  userCode: string,
  correctnessScore: number
): Promise<z.infer<typeof codingEvaluationResultSchema>> => {
  if (!env.GEMINI_API_KEY) {
    logger.info('🔑 GEMINI_API_KEY not configured. Generating offline coding evaluation.');
    return evaluateCodingSessionOffline(userCode, language, correctnessScore);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const prompt = `You are a senior software engineering interviewer.
    Review the following coding interview submission.
    
    PROBLEM TITLE: ${title}
    PROBLEM DESCRIPTION:
    ${description}
    
    SUBMITTED CODE (Language: ${language}):
    ${userCode}
    
    TEST CASES CORRECTNESS SCORE: ${correctnessScore}% (Percentage of passed hidden/standard test cases)
    
    Please evaluate the candidate's code on these criteria:
    - correctnessScore: integer from 0 to 100 (should align closely with the correctness score provided: ${correctnessScore}).
    - codeQualityScore: integer from 0 to 100 based on readability, naming conventions, and structure.
    - complexityScore: integer from 0 to 100 based on Big-O efficiency (Time & Space).
    - optimizationScore: integer from 0 to 100 based on edge cases, memory optimization, and modularity.
    
    Constructive feedback:
    - strengths: string (markdown format with bullet points)
    - weaknesses: string (markdown format with bullet points)
    - recommendations: string (markdown format with bullet points)
    
    Optionally, estimate a similarityScore (0 to 100) representing how similar the user's code is to a standard optimal solution.
    
    You MUST return your response strictly as a JSON object matching this structure:
    {
      "correctnessScore": number,
      "codeQualityScore": number,
      "complexityScore": number,
      "optimizationScore": number,
      "strengths": string,
      "weaknesses": string,
      "recommendations": string,
      "similarityScore": number
    }
    
    Do not wrap your response in markdown code blocks like \`\`\`json.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) throw new Error('Gemini returned empty coding evaluation response');
    const parsed = JSON.parse(text);
    return codingEvaluationResultSchema.parse(parsed);
  } catch (error: any) {
    logger.error(`💥 Gemini coding evaluation failed: ${error.message}. Falling back.`);
    return evaluateCodingSessionOffline(userCode, language, correctnessScore);
  }
};

export const evaluateCodingSessionOffline = async (
  code: string,
  language: string,
  correctnessScore: number
): Promise<{
  correctnessScore: number;
  codeQualityScore: number;
  complexityScore: number;
  optimizationScore: number;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  similarityScore: number;
}> => {
  const lineCount = code.split('\n').length;
  let nestingDepth = 0;
  let loopsCount = 0;
  let functionCount = 0;
  let hasRecursion = false;

  const lang = language.toLowerCase();

  // 1. Nesting Depth
  if (lang === 'python' || lang === 'py') {
    let maxIndent = 0;
    code.split('\n').forEach(line => {
      const match = line.match(/^(\s*)/);
      if (match) {
        const spaces = match[1].length;
        if (spaces > maxIndent) maxIndent = spaces;
      }
    });
    nestingDepth = Math.round(maxIndent / 4);
  } else {
    let currentDepth = 0;
    for (let char of code) {
      if (char === '{') {
        currentDepth++;
        if (currentDepth > nestingDepth) nestingDepth = currentDepth;
      } else if (char === '}') {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }
  }

  // 2. Loops Count
  const loopMatches = code.match(/\b(for|while)\b/g);
  loopsCount = loopMatches ? loopMatches.length : 0;

  // 3. Functions Count
  if (lang === 'python' || lang === 'py') {
    const funcs = code.match(/\bdef\s+\w+/g);
    functionCount = funcs ? funcs.length : 1;
  } else if (lang === 'java') {
    const funcs = code.match(/\b(public|private|protected|static)\s+\w+\s+\w+\(/g);
    functionCount = funcs ? funcs.length : 1;
  } else {
    const funcs = code.match(/(\bfunction\b|=>)/g);
    functionCount = funcs ? funcs.length : 1;
  }

  // 4. Recursion Checks
  const functionNames: string[] = [];
  const funcRegex = lang === 'python' || lang === 'py' 
    ? /\bdef\s+(\w+)/g 
    : /\b(?:function|class)?\s*(\w+)\s*\(/g;
  let match;
  while ((match = funcRegex.exec(code)) !== null) {
    if (match[1] && !['for', 'if', 'while', 'switch', 'catch'].includes(match[1])) {
      functionNames.push(match[1]);
    }
  }
  
  for (let name of functionNames) {
    const occurrences = code.split(name).length - 1;
    if (occurrences >= 2) {
      hasRecursion = true;
      break;
    }
  }

  // Calculate scores
  let codeQualityScore = 85;
  if (nestingDepth > 3) codeQualityScore -= 10;
  if (lineCount > 150) codeQualityScore -= 5;
  if (functionCount < 1) codeQualityScore -= 5;

  let complexityScore = 80;
  if (loopsCount > 2) complexityScore -= 10;
  if (nestingDepth > 2) complexityScore -= 5;

  let optimizationScore = 75;
  if (hasRecursion) optimizationScore += 5;
  if (loopsCount === 0) optimizationScore -= 10;

  // Bound scores
  codeQualityScore = Math.max(10, Math.min(100, codeQualityScore));
  complexityScore = Math.max(10, Math.min(100, complexityScore));
  optimizationScore = Math.max(10, Math.min(100, optimizationScore));

  const similarityScore = Math.round(correctnessScore * 0.9);

  // Generate textual descriptions
  const strengths = `• The code structure is clear and follows basic ${language} syntax standards.\n• Line count is kept optimal (${lineCount} lines).\n• Correctly structured control statements.`;
  
  const weaknesses = `• Max nesting depth reached is ${nestingDepth}, which might decrease readability.\n• Loop count is ${loopsCount}. Avoid deeply nested loop structures for optimized Time Complexity.\n• ${hasRecursion ? 'Recursive calls were detected; ensure base cases are securely validated to prevent stack overflow.' : 'No recursion was utilized.'}`;
  
  const recommendations = `• Practice reducing maximum nesting depth by modularizing code block logic.\n• Review Space Complexity considerations for recursion stack frames.\n• Verify all potential edge cases (empty inputs, out of bound values).`;

  return {
    correctnessScore,
    codeQualityScore,
    complexityScore,
    optimizationScore,
    strengths,
    weaknesses,
    recommendations,
    similarityScore,
  };
};
