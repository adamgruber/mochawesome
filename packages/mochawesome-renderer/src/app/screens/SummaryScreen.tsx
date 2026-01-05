import type { Summary } from '../../domain';
import { SummaryCard } from '../../components/SummaryCard';

const formatDate = (iso: string) => new Date(iso).toLocaleString();

export type SummaryScreenProps = {
  summary: Summary;
};

export const SummaryScreen = ({ summary }: SummaryScreenProps) => {
  const { stats, meta, warnings } = summary;

  return (
    <section className="summary">
      <div className="summary__header">
        <div>
          <h2 className="summary__title">Summary</h2>
          <p className="summary__subtitle">Run overview and headline counts.</p>
        </div>
        <div className="summary__meta">
          <div>{formatDate(meta.generatedAt)}</div>
          <div className="summary__meta-row">
            <span>{meta.runner.name}</span>
            <span className="summary__dot">•</span>
            <span>{meta.runner.version}</span>
          </div>
        </div>
      </div>

      <div className="summary__grid">
        <SummaryCard label="Suites" value={stats.suites} tone="neutral" />
        <SummaryCard label="Tests" value={stats.tests} tone="neutral" />
        <SummaryCard label="Passes" value={stats.passes} tone="pass" />
        <SummaryCard label="Failures" value={stats.failures} tone="fail" />
        <SummaryCard label="Pending" value={stats.pending} tone="warn" />
        <SummaryCard label="Skipped" value={stats.skipped} tone="info" />
      </div>

      <div className="summary__footer">
        <div className="summary__timing">
          <div>
            <div className="summary__label">Start</div>
            <div>{formatDate(stats.start)}</div>
          </div>
          <div>
            <div className="summary__label">End</div>
            <div>{formatDate(stats.end)}</div>
          </div>
          <div>
            <div className="summary__label">Duration</div>
            <div>{stats.durationMs} ms</div>
          </div>
        </div>

        <div className="summary__warnings">
          <div className="summary__label">Warnings</div>
          <div>{warnings.length}</div>
        </div>
      </div>
    </section>
  );
};
