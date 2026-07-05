import type {
  DeadLetterEntry,
  Job,
  JobDetail,
  MetricsSnapshot,
  Organization,
  OrgMember,
  Project,
  ProjectDetail,
  Queue,
  QueueStats,
  RetryPolicy,
  SystemEvent,
  ThroughputPoint,
  Worker,
  WorkerDetail,
} from '../lib/api';

export const DEMO_ORG_ID = 'demo-org-acme';
export const DEMO_PROJECT_BILLING = 'demo-proj-billing';
export const DEMO_PROJECT_MAIN = 'demo-proj-main';

export const DEMO_USER = {
  id: 'demo-user-athul',
  email: 'admin@test.local',
  name: 'Athul S',
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const minsAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();

export const DEMO_RETRY_POLICIES: RetryPolicy[] = [
  { id: 'demo-policy-1', name: 'Default Exponential', strategy: 'EXPONENTIAL', maxAttempts: 3, baseDelayMs: 5000 },
  { id: 'demo-policy-2', name: 'Fixed Retry', strategy: 'FIXED', maxAttempts: 5, baseDelayMs: 10000 },
  { id: 'demo-policy-3', name: 'Linear Backoff', strategy: 'LINEAR', maxAttempts: 4, baseDelayMs: 3000 },
];

export const DEMO_QUEUES: Record<string, Queue[]> = {
  [DEMO_PROJECT_BILLING]: [
    {
      id: 'demo-q-stripe',
      name: 'stripe-events',
      description: 'Stripe webhook ingestion (checkout, invoice, dispute)',
      priority: 10,
      concurrency: 8,
      status: 'ACTIVE',
      rateLimitPerMin: 120,
      shardKey: 'payments',
      retryPolicy: DEMO_RETRY_POLICIES[0],
      _count: { jobs: 142 },
    },
    {
      id: 'demo-q-webhooks',
      name: 'webhooks',
      description: 'Outbound HTTP callbacks to customer endpoints',
      priority: 8,
      concurrency: 6,
      status: 'ACTIVE',
      rateLimitPerMin: 80,
      retryPolicy: DEMO_RETRY_POLICIES[0],
      _count: { jobs: 89 },
    },
    {
      id: 'demo-q-dunning',
      name: 'dunning',
      description: 'Failed payment reminders',
      priority: 5,
      concurrency: 4,
      status: 'ACTIVE',
      retryPolicy: DEMO_RETRY_POLICIES[1],
      _count: { jobs: 34 },
    },
    {
      id: 'demo-q-emails',
      name: 'emails',
      description: 'Transactional email delivery',
      priority: 6,
      concurrency: 5,
      status: 'PAUSED',
      rateLimitPerMin: 60,
      shardKey: 'notifications',
      retryPolicy: DEMO_RETRY_POLICIES[0],
      _count: { jobs: 56 },
    },
  ],
  [DEMO_PROJECT_MAIN]: [
    {
      id: 'demo-q-default',
      name: 'default',
      description: 'General background work',
      priority: 0,
      concurrency: 4,
      status: 'ACTIVE',
      retryPolicy: DEMO_RETRY_POLICIES[0],
      _count: { jobs: 28 },
    },
  ],
};

export const DEMO_QUEUE_STATS: Record<string, QueueStats> = {
  'demo-q-stripe': { queued: 12, running: 3, completed: 118, failed: 7, deadLetter: 2, throughputPerMinute: 24, avgDurationMs: 640 },
  'demo-q-webhooks': { queued: 5, running: 2, completed: 76, failed: 4, deadLetter: 2, throughputPerMinute: 18, avgDurationMs: 820 },
  'demo-q-dunning': { queued: 2, running: 0, completed: 29, failed: 2, deadLetter: 1, throughputPerMinute: 6, avgDurationMs: 1100 },
  'demo-q-emails': { queued: 8, running: 0, completed: 44, failed: 3, deadLetter: 1, throughputPerMinute: 0, avgDurationMs: 450 },
  'demo-q-default': { queued: 1, running: 1, completed: 24, failed: 1, deadLetter: 0, throughputPerMinute: 4, avgDurationMs: 380 },
};

export const DEMO_ORGANIZATIONS: Organization[] = [
  {
    id: DEMO_ORG_ID,
    name: 'Acme Corp',
    slug: 'acme',
    role: 'OWNER',
    _count: { projects: 2, members: 5 },
  },
];

export const DEMO_PROJECTS: Project[] = [
  { id: DEMO_PROJECT_BILLING, name: 'billing-service', description: 'Invoices, dunning, Stripe webhooks', _count: { queues: 4 } },
  { id: DEMO_PROJECT_MAIN, name: 'main-app', description: 'Main product app', _count: { queues: 1 } },
];

export const DEMO_MEMBERS: OrgMember[] = [
  { id: 'demo-m-1', role: 'OWNER', user: { id: 'demo-user-athul', email: 'admin@test.local', name: 'Athul S' }, createdAt: hoursAgo(720) },
  { id: 'demo-m-2', role: 'ADMIN', user: { id: 'demo-m-2-u', email: 'sarah@acme.io', name: 'RA2311047010117' }, createdAt: hoursAgo(500) },
  { id: 'demo-m-3', role: 'MEMBER', user: { id: 'demo-m-3-u', email: 'james@acme.io', name: 'James T' }, createdAt: hoursAgo(300) },
  { id: 'demo-m-4', role: 'MEMBER', user: { id: 'demo-m-4-u', email: 'as2227@srmist.edu.in', name: 'as2227@srmist.edu.in' }, createdAt: hoursAgo(200) },
  { id: 'demo-m-5', role: 'VIEWER', user: { id: 'demo-m-5-u', email: 'contact.athuls@gmail.com', name: 'contact.athuls@gmail.com' }, createdAt: hoursAgo(100) },
];

export const DEMO_WORKERS: Worker[] = [
  { id: 'demo-w-1', hostname: 'worker-prod-01', status: 'ONLINE', concurrency: 8, activeJobs: 2, shardKey: undefined, lastSeenAt: minsAgo(1), startedAt: hoursAgo(72) },
  { id: 'demo-w-2', hostname: 'worker-prod-02', status: 'ONLINE', concurrency: 8, activeJobs: 1, shardKey: 'notifications', lastSeenAt: minsAgo(1), startedAt: hoursAgo(72) },
  { id: 'demo-w-3', hostname: 'worker-prod-03', status: 'ONLINE', concurrency: 6, activeJobs: 3, shardKey: 'payments', lastSeenAt: minsAgo(2), startedAt: hoursAgo(48) },
  { id: 'demo-w-4', hostname: 'worker-staging-01', status: 'ONLINE', concurrency: 4, activeJobs: 0, lastSeenAt: minsAgo(3), startedAt: hoursAgo(24) },
  { id: 'demo-w-5', hostname: 'worker-staging-02', status: 'DRAINING', concurrency: 4, activeJobs: 0, shardKey: 'notifications', lastSeenAt: minsAgo(8), startedAt: hoursAgo(12) },
  { id: 'demo-w-6', hostname: 'worker-legacy-01', status: 'OFFLINE', concurrency: 2, activeJobs: 0, lastSeenAt: hoursAgo(6), startedAt: hoursAgo(168) },
];

const workerDetails: Record<string, WorkerDetail> = Object.fromEntries(
  DEMO_WORKERS.map((w) => [
    w.id,
    {
      ...w,
      heartbeats: Array.from({ length: 5 }, (_, i) => ({
        id: `hb-${w.id}-${i}`,
        activeJobs: Math.max(0, w.activeJobs - i),
        memoryMb: 120 + i * 8,
        createdAt: minsAgo(i * 2 + 1),
      })),
      executions: [
        { id: `ex-${w.id}-1`, attempt: 1, status: 'COMPLETED', startedAt: minsAgo(12), durationMs: 640 },
        { id: `ex-${w.id}-2`, attempt: 1, status: 'COMPLETED', startedAt: minsAgo(8), durationMs: 420 },
      ],
    },
  ])
);

function makeJob(
  id: string,
  queueId: string,
  status: string,
  handler: string,
  extra: Partial<Job> = {}
): Job {
  return {
    id,
    queueId,
    type: 'IMMEDIATE',
    status,
    handler,
    payload: { demo: true, handler },
    priority: 50,
    attempt: status === 'FAILED' ? 3 : 1,
    maxAttempts: 3,
    createdAt: minsAgo(30),
    startedAt: status !== 'QUEUED' ? minsAgo(28) : undefined,
    completedAt: status === 'COMPLETED' ? minsAgo(27) : undefined,
    durationMs: status === 'COMPLETED' ? 640 : undefined,
    lastError: status === 'FAILED' ? 'ECONNREFUSED: upstream billing API unreachable' : undefined,
    claimedBy: status === 'RUNNING' ? { id: 'demo-w-3', hostname: 'worker-prod-03' } : undefined,
    _count: { executions: 2, logs: 4 },
    ...extra,
  };
}

export const DEMO_JOBS: Job[] = [
  makeJob('demo-job-1', 'demo-q-stripe', 'RUNNING', 'http_request', { type: 'IMMEDIATE', priority: 90 }),
  makeJob('demo-job-2', 'demo-q-stripe', 'QUEUED', 'send_email', { type: 'IMMEDIATE' }),
  makeJob('demo-job-3', 'demo-q-stripe', 'COMPLETED', 'process_data', { type: 'IMMEDIATE', durationMs: 812 }),
  makeJob('demo-job-4', 'demo-q-stripe', 'FAILED', 'http_request', { type: 'IMMEDIATE', attempt: 3 }),
  makeJob('demo-job-5', 'demo-q-stripe', 'COMPLETED', 'echo', { type: 'IMMEDIATE' }),
  makeJob('demo-job-6', 'demo-q-stripe', 'QUEUED', 'sleep', { type: 'DELAYED' }),
  makeJob('demo-job-7', 'demo-q-webhooks', 'RUNNING', 'http_request'),
  makeJob('demo-job-8', 'demo-q-webhooks', 'COMPLETED', 'send_email'),
  makeJob('demo-job-9', 'demo-q-dunning', 'QUEUED', 'send_email', { type: 'SCHEDULED' }),
  makeJob('demo-job-10', 'demo-q-emails', 'COMPLETED', 'send_email'),
  makeJob('demo-job-11', 'demo-q-default', 'RUNNING', 'process_data'),
];

const jobDetails: Record<string, JobDetail> = Object.fromEntries(
  DEMO_JOBS.map((j) => [
    j.id,
    {
      ...j,
      executions: [
        {
          id: `exec-${j.id}-1`,
          attempt: 1,
          status: j.status === 'FAILED' ? 'FAILED' : 'COMPLETED',
          startedAt: j.startedAt || j.createdAt,
          completedAt: j.completedAt,
          durationMs: j.durationMs,
          error: j.lastError,
          workerId: j.claimedBy?.id || 'demo-w-1',
        },
      ],
      logs: [
        { id: `log-${j.id}-1`, level: 'info', message: `Starting handler ${j.handler}`, createdAt: j.createdAt },
        { id: `log-${j.id}-2`, level: j.status === 'FAILED' ? 'error' : 'info', message: j.lastError || 'Completed successfully', createdAt: j.completedAt || minsAgo(26) },
      ],
      deadLetter: j.status === 'FAILED' && j.attempt >= j.maxAttempts
        ? {
            id: `dlq-${j.id}`,
            jobId: j.id,
            handler: j.handler,
            lastError: j.lastError || 'Unknown error',
            failureSummary: 'Connection refused — upstream endpoint may be down or firewall blocked port 443.',
            totalAttempts: j.attempt,
            failedAt: minsAgo(20),
          }
        : undefined,
    },
  ])
);

export const DEMO_DLQ: DeadLetterEntry[] = [
  { id: 'demo-dlq-1', jobId: 'demo-job-4', handler: 'http_request', lastError: 'ECONNREFUSED', failureSummary: 'Connection refused — billing webhook endpoint unreachable.', totalAttempts: 3, failedAt: minsAgo(45) },
  { id: 'demo-dlq-2', jobId: 'demo-dlq-j2', handler: 'http_request', lastError: 'ETIMEDOUT', failureSummary: 'Request timed out after 30s. Customer endpoint may be overloaded.', totalAttempts: 5, failedAt: minsAgo(120) },
  { id: 'demo-dlq-3', jobId: 'demo-dlq-j3', handler: 'send_email', lastError: 'SMTP 550', failureSummary: 'Mailbox unavailable. Recipient address may be invalid.', totalAttempts: 3, failedAt: hoursAgo(2) },
  { id: 'demo-dlq-4', jobId: 'demo-dlq-j4', handler: 'http_request', lastError: '401 Unauthorized', failureSummary: 'Auth error. Token or credentials in payload may be stale.', totalAttempts: 4, failedAt: hoursAgo(5) },
  { id: 'demo-dlq-5', jobId: 'demo-dlq-j5', handler: 'process_data', lastError: 'OOM', failureSummary: 'Worker ran out of memory processing large CSV batch.', totalAttempts: 3, failedAt: hoursAgo(8) },
  { id: 'demo-dlq-6', jobId: 'demo-dlq-j6', handler: 'http_request', lastError: 'ENOTFOUND', failureSummary: 'DNS lookup failed for customer callback host.', totalAttempts: 3, failedAt: hoursAgo(12) },
  { id: 'demo-dlq-7', jobId: 'demo-dlq-j7', handler: 'random_fail', lastError: 'Simulated failure', failureSummary: 'Handler random_fail exceeded retry budget during chaos test.', totalAttempts: 3, failedAt: hoursAgo(24) },
  { id: 'demo-dlq-8', jobId: 'demo-dlq-j8', handler: 'http_request', lastError: '429 Too Many Requests', failureSummary: 'Rate limited by upstream. Back off and retry later.', totalAttempts: 5, failedAt: hoursAgo(36) },
];

export const DEMO_EVENTS: SystemEvent[] = [
  { id: 'ev-1', type: 'job:completed', source: 'worker', payload: { queue: 'stripe-events', durationMs: 640 }, createdAt: minsAgo(2) },
  { id: 'ev-2', type: 'job:claimed', source: 'worker', payload: { queue: 'stripe-events', worker: 'worker-prod-03' }, createdAt: minsAgo(3) },
  { id: 'ev-3', type: 'job:created', source: 'api', payload: { queue: 'webhooks', handler: 'http_request' }, createdAt: minsAgo(5) },
  { id: 'ev-4', type: 'scheduler:tick', source: 'scheduler', payload: { promoted: 4, staleWorkers: 0 }, createdAt: minsAgo(1) },
  { id: 'ev-5', type: 'job:dead_letter', source: 'api', payload: { queue: 'webhooks', error: 'ECONNREFUSED' }, createdAt: minsAgo(15) },
  { id: 'ev-6', type: 'worker:registered', source: 'worker', payload: { hostname: 'worker-prod-01' }, createdAt: hoursAgo(1) },
  { id: 'ev-7', type: 'job:retry_scheduled', source: 'api', payload: { attempt: 2, delayMs: 10000 }, createdAt: minsAgo(20) },
  { id: 'ev-8', type: 'batch:created', source: 'api', payload: { count: 12 }, createdAt: hoursAgo(3) },
];

export const DEMO_THROUGHPUT: ThroughputPoint[] = Array.from({ length: 12 }, (_, i) => ({
  hour: new Date(Date.now() - (11 - i) * 60 * 60 * 1000).toISOString(),
  completed: 20 + (i % 5) * 3,
  failed: 2 + (i % 3),
  avgDurationMs: 520 + (i % 4) * 90,
}));

export const DEMO_METRICS: MetricsSnapshot = {
  timestamp: new Date().toISOString(),
  totalJobs: 717,
  activeWorkers: 4,
  jobsPerMinute: 24,
  successRate: 94,
  avgLatencyMs: 640,
  queueHealth: {
    'stripe-events': DEMO_QUEUE_STATS['demo-q-stripe'],
    webhooks: DEMO_QUEUE_STATS['demo-q-webhooks'],
    dunning: DEMO_QUEUE_STATS['demo-q-dunning'],
    emails: DEMO_QUEUE_STATS['demo-q-emails'],
    default: DEMO_QUEUE_STATS['demo-q-default'],
  },
};

export function getDemoProject(projectId: string): ProjectDetail | null {
  const project = DEMO_PROJECTS.find((p) => p.id === projectId);
  if (!project) return null;
  return { ...project, queues: DEMO_QUEUES[projectId] || [] };
}

export function getDemoJob(jobId: string): JobDetail | null {
  return jobDetails[jobId] || null;
}

export function getDemoWorker(workerId: string): WorkerDetail | null {
  return workerDetails[workerId] || null;
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    pagination: { page, limit, total, totalPages },
  };
}
