import { prisma } from '../lib/prisma';
import { getQueueStats } from './queue.service';

export async function getSystemMetrics() {
  const oneMinuteAgo = new Date(Date.now() - 60_000);
  const oneHourAgo = new Date(Date.now() - 3_600_000);

  const [
    totalJobs,
    activeWorkers,
    recentCompleted,
    recentFailed,
    recentExecutions,
    queues,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.worker.count({ where: { status: 'ONLINE' } }),
    prisma.job.count({
      where: { status: 'COMPLETED', completedAt: { gte: oneMinuteAgo } },
    }),
    prisma.job.count({
      where: {
        status: { in: ['FAILED', 'DEAD_LETTER'] },
        updatedAt: { gte: oneHourAgo },
      },
    }),
    prisma.jobExecution.findMany({
      where: { completedAt: { gte: oneHourAgo }, durationMs: { not: null } },
      select: { durationMs: true, status: true },
    }),
    prisma.queue.findMany({ select: { id: true, name: true } }),
  ]);

  const durations = recentExecutions
    .filter((e) => e.status === 'COMPLETED' && e.durationMs)
    .map((e) => e.durationMs!);

  const successCount = recentExecutions.filter((e) => e.status === 'COMPLETED').length;
  const totalRecent = recentExecutions.length;

  const queueHealth: Record<string, Awaited<ReturnType<typeof getQueueStats>>> = {};
  for (const queue of queues) {
    queueHealth[queue.name] = await getQueueStats(queue.id);
  }

  return {
    timestamp: new Date().toISOString(),
    totalJobs,
    activeWorkers,
    jobsPerMinute: recentCompleted,
    successRate: totalRecent > 0 ? Math.round((successCount / totalRecent) * 100) : 100,
    avgLatencyMs:
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0,
    recentFailed,
    queueHealth,
  };
}

export async function getThroughputHistory(hours = 24) {
  const since = new Date(Date.now() - hours * 3_600_000);

  const executions = await prisma.jobExecution.findMany({
    where: { startedAt: { gte: since } },
    select: { startedAt: true, status: true, durationMs: true },
    orderBy: { startedAt: 'asc' },
  });

  const buckets: Record<string, { completed: number; failed: number; totalDuration: number }> = {};

  for (const exec of executions) {
    const hour = exec.startedAt.toISOString().slice(0, 13);
    if (!buckets[hour]) {
      buckets[hour] = { completed: 0, failed: 0, totalDuration: 0 };
    }
    if (exec.status === 'COMPLETED') {
      buckets[hour].completed++;
      buckets[hour].totalDuration += exec.durationMs ?? 0;
    } else if (exec.status === 'FAILED') {
      buckets[hour].failed++;
    }
  }

  return Object.entries(buckets).map(([hour, data]) => ({
    hour,
    completed: data.completed,
    failed: data.failed,
    avgDurationMs: data.completed > 0 ? Math.round(data.totalDuration / data.completed) : 0,
  }));
}
