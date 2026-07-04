import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { RefreshCw, RotateCcw, XCircle, Eye, Plus } from 'lucide-react';
import { api, Job } from '../lib/api';
import { useApp } from '../context/AppContext';
import { Badge, Button, Card, Select, Spinner, EmptyState } from '../components/ui';
import { Pagination } from '../components/Pagination';
import { CreateJobModal } from '../components/CreateJobModal';
import { JobDetailModal } from '../components/JobDetailModal';
import { useWebSocket } from '../hooks/useWebSocket';

export function JobsPage() {
  const { project, canMutate } = useApp();
  const queues = project?.queues || [];
  const [selectedQueue, setSelectedQueue] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadJobs = useCallback(async () => {
    if (!selectedQueue) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (statusFilter) params.status = statusFilter;
      const result = await api.getJobs(selectedQueue, params);
      setJobs(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } finally {
      setLoading(false);
    }
  }, [selectedQueue, statusFilter, page]);

  useWebSocket({ 'job:created': loadJobs, 'job:completed': loadJobs, 'job:claimed': loadJobs, 'job:dead_letter': loadJobs });

  useEffect(() => {
    if (!queues.length) {
      setSelectedQueue('');
      return;
    }
    const stripe = queues.find(
      (q) => q.name === 'stripe-events' || q.name.startsWith('stripe')
    );
    setSelectedQueue((prev) => {
      if (prev && queues.some((q) => q.id === prev)) return prev;
      return (stripe ?? queues[0]).id;
    });
  }, [queues]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Jobs</h2>
          <p className="text-text-secondary text-sm">{project?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadJobs}><RefreshCw size={16} className="inline mr-1" />Refresh</Button>
          {canMutate && selectedQueue && (
            <Button onClick={() => setShowCreate(true)}><Plus size={16} className="inline mr-1" />New job</Button>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Select label="Queue" value={selectedQueue} onChange={(e) => { setSelectedQueue(e.target.value); setPage(1); }}>
          {queues.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
        </Select>
        <Select label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All</option>
          {['QUEUED', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED', 'DEAD_LETTER'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {loading ? <Spinner /> : jobs.length === 0 ? (
        <EmptyState message="no jobs in this queue" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary text-left">
                <th className="px-4 py-3">Handler</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Attempt</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-border/50 hover:bg-surface/50">
                  <td className="px-4 py-3 font-mono text-xs">{job.handler}</td>
                  <td className="px-4 py-3"><Badge status={job.status} /></td>
                  <td className="px-4 py-3 text-text-secondary">{job.type}</td>
                  <td className="px-4 py-3">{job.attempt}/{job.maxAttempts}</td>
                  <td className="px-4 py-3">{job.durationMs ? `${job.durationMs}ms` : '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">{format(new Date(job.createdAt), 'MMM d HH:mm')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedJobId(job.id)} className="p-1.5 hover:bg-surface-overlay rounded"><Eye size={16} /></button>
                      {canMutate && ['FAILED', 'DEAD_LETTER'].includes(job.status) && (
                        <button onClick={() => api.retryJob(job.id).then(loadJobs)} className="p-1.5 hover:bg-surface-overlay rounded"><RotateCcw size={16} /></button>
                      )}
                      {canMutate && !['COMPLETED', 'DEAD_LETTER', 'CANCELLED'].includes(job.status) && (
                        <button onClick={() => api.cancelJob(job.id).then(loadJobs)} className="p-1.5 hover:bg-surface-overlay rounded"><XCircle size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 pb-4">
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
          </div>
        </Card>
      )}

      {showCreate && selectedQueue && (
        <CreateJobModal queueId={selectedQueue} onClose={() => setShowCreate(false)} onCreated={loadJobs} />
      )}
      {selectedJobId && <JobDetailModal jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />}
    </div>
  );
}
