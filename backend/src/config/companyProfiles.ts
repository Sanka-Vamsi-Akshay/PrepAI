import { CompanyProfile, Difficulty } from '@prisma/client';

export interface CompanyConfig {
  id: CompanyProfile;
  name: string;
  focusAreas: string[];
  evaluationPillars: string[];
  defaultDifficulty: Difficulty;
  fallbackQuestionThemes: string[];
  recommendationCategories: string[];
}

export const COMPANY_PROFILES: Record<CompanyProfile, CompanyConfig> = {
  GOOGLE: {
    id: CompanyProfile.GOOGLE,
    name: 'Google',
    focusAreas: ['DSA', 'Scalability', 'System Design'],
    evaluationPillars: ['Problem Solving', 'Communication', 'System Thinking'],
    defaultDifficulty: Difficulty.HARD,
    fallbackQuestionThemes: [
      'dynamic programming and graph algorithms',
      'efficient cache eviction and high throughput indexing',
      'distributed key-value store consistency under network partition',
      'large scale map-reduce data pipeline bottlenecks'
    ],
    recommendationCategories: [
      'Practice distributed systems design patterns',
      'Study advanced caching strategies',
      'Optimize algorithm complexity and Big-O efficiency'
    ]
  },
  META: {
    id: CompanyProfile.META,
    name: 'Meta',
    focusAreas: ['Coding', 'Product Thinking', 'Communication'],
    evaluationPillars: ['Product Thinking', 'Coding Excellence', 'Execution'],
    defaultDifficulty: Difficulty.HARD,
    fallbackQuestionThemes: [
      'high-concurrency news feed generation and caching',
      'fast client-side state synchronization with WebSocket backends',
      'efficient graph traversal for social connection metrics',
      'product usage telemetry logging at global scale'
    ],
    recommendationCategories: [
      'Optimize coding execution speed and edge case coverage',
      'Elaborate on product tradeoffs and user experience goals',
      'Work on client-side state models and data synchronization'
    ]
  },
  AMAZON: {
    id: CompanyProfile.AMAZON,
    name: 'Amazon',
    focusAreas: ['DSA', 'Leadership Principles', 'Ownership'],
    evaluationPillars: ['Ownership', 'Bias for Action', 'Customer Obsession'],
    defaultDifficulty: Difficulty.MEDIUM_HARD,
    fallbackQuestionThemes: [
      'customer order placement processing under high load spikes',
      'managing technical debt and advocating for long-term ownership',
      'making data-driven design decisions under tight timelines',
      'resilient payment gateway integrations and fallback queues'
    ],
    recommendationCategories: [
      'Review Amazon Leadership Principles and embed them in answers',
      'Explain bias for action and calculated risk-taking choices',
      'Focus on customer metrics, service SLA guarantees, and reliability'
    ]
  },
  MICROSOFT: {
    id: CompanyProfile.MICROSOFT,
    name: 'Microsoft',
    focusAreas: ['Coding', 'Collaboration', 'Design'],
    evaluationPillars: ['Design Quality', 'Cooperation', 'Correctness'],
    defaultDifficulty: Difficulty.MEDIUM_HARD,
    fallbackQuestionThemes: [
      'modular software design and SOLID design principles',
      'collaborative codebase architecture and code review conflicts',
      'enterprise software backward compatibility and testing',
      'scalable cloud storage systems and microservices integration'
    ],
    recommendationCategories: [
      'Focus on code clarity, readability, and clean modular interfaces',
      'Explain collaboration tradeoffs and alignment across teams',
      'Study enterprise design patterns and automated regression testing'
    ]
  },
  STARTUP: {
    id: CompanyProfile.STARTUP,
    name: 'Startup',
    focusAreas: ['Practical Engineering', 'Product Delivery', 'Debugging'],
    evaluationPillars: ['Speed', 'Pragmatism', 'Execution'],
    defaultDifficulty: Difficulty.MEDIUM,
    fallbackQuestionThemes: [
      'rapid MVP deployment and simple database structure tradeoffs',
      'debugging third-party API rate limits and webhooks failure',
      'monitoring production crashes and hotfix deployment pipelines',
      'setting up quick scalable analytics telemetry'
    ],
    recommendationCategories: [
      'Focus on rapid product delivery tradeoffs and pragmatism',
      'Review production debugging practices and crash telemetry',
      'Learn lean system architecture and simple horizontal scaling principles'
    ]
  },
  ACCENTURE: {
    id: CompanyProfile.ACCENTURE,
    name: 'Accenture',
    focusAreas: ['Fundamentals', 'Aptitude', 'HR Questions'],
    evaluationPillars: ['Programming Basics', 'Professional Attitude', 'Communication'],
    defaultDifficulty: Difficulty.EASY_MEDIUM,
    fallbackQuestionThemes: [
      'cloud infrastructure architecture fundamentals',
      'standard relational database index structures',
      'aligning client deliverables and managing expectations',
      'basic microservices service lifecycle management'
    ],
    recommendationCategories: [
      'Study basic cloud deployment models and system integration',
      'Explain consulting trade-offs and client requirements clearly',
      'Strengthen basic programming and system design concepts'
    ]
  },
  TCS: {
    id: CompanyProfile.TCS,
    name: 'TCS',
    focusAreas: ['Fundamentals', 'Aptitude', 'HR Questions'],
    evaluationPillars: ['Programming Basics', 'Professional Attitude', 'Communication'],
    defaultDifficulty: Difficulty.EASY,
    fallbackQuestionThemes: [
      'object-oriented design inheritance and polymorphism',
      'standard array sorting and searching algorithms',
      'handling tight deadlines and project collaboration scenario',
      'basic database connection pools and SQL joins'
    ],
    recommendationCategories: [
      'Strengthen basic programming syntax and logic flows',
      'Explain concepts with structured examples and simple terms',
      'Prepare standard HR responses using structured communication'
    ]
  },
  INFOSYS: {
    id: CompanyProfile.INFOSYS,
    name: 'Infosys',
    focusAreas: ['Fundamentals', 'Aptitude', 'HR Questions'],
    evaluationPillars: ['Programming Basics', 'Professional Attitude', 'Communication'],
    defaultDifficulty: Difficulty.EASY,
    fallbackQuestionThemes: [
      'basic memory allocations and reference types',
      'logical loop debugging and array manipulations',
      'teamwork challenges and resolving team conflicts',
      'web application lifecycles and HTTP request basics'
    ],
    recommendationCategories: [
      'Strengthen basic programming syntax and conditional structures',
      'Practice basic algorithm logic and array operations',
      'Prepare standard corporate ethics and team collaboration answers'
    ]
  },
  WIPRO: {
    id: CompanyProfile.WIPRO,
    name: 'Wipro',
    focusAreas: ['Fundamentals', 'Aptitude', 'HR Questions'],
    evaluationPillars: ['Programming Basics', 'Professional Attitude', 'Communication'],
    defaultDifficulty: Difficulty.EASY,
    fallbackQuestionThemes: [
      'standard relational database schemas and basic querying',
      'conditional logic flow and control statement choices',
      'handling shifting client requirements and code updates',
      'collaborating in distributed software developer teams'
    ],
    recommendationCategories: [
      'Strengthen basic programming syntax and control statements',
      'Review fundamental database normalization and basic SQL syntax',
      'Work on structured verbal communication and active listening'
    ]
  }
};

export const SUPPORTED_COMPANIES: CompanyProfile[] = Object.keys(COMPANY_PROFILES) as CompanyProfile[];
