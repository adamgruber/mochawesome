import type { Summary, SuiteTreeItem } from '../domain';
import { SummaryScreen } from './screens/SummaryScreen';
import { SuiteTreeScreen } from './screens/SuiteTreeScreen';
import '../styles/app.css';

export type AppProps = {
  summary: Summary;
  suiteTree: SuiteTreeItem;
};

export const App = ({ summary, suiteTree }: AppProps) => (
  <div className="app">
    <header className="app__header">
      <div>
        <div className="app__eyebrow">Mochawesome v8</div>
        <h1 className="app__title">Test Report</h1>
      </div>
      <div className="app__meta">
        <span>{summary.meta.runner.name}</span>
        <span className="app__dot">•</span>
        <span>{summary.meta.runner.version}</span>
        <span className="app__dot">•</span>
        <span>{summary.meta.reporter.version}</span>
      </div>
    </header>

    <main className="app__main">
      <SummaryScreen summary={summary} />
      <SuiteTreeScreen tree={suiteTree} />
    </main>
  </div>
);
