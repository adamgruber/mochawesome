import { createRoot } from 'react-dom/client';
import basicFixture from '../../fixtures/basic.json';
import type { Report } from '../../../mochawesome/src/core/model';
import { App } from '../app/App';
import { buildIndex, createSelectors, loadReport } from '../domain';

const report = loadReport(basicFixture as Report);
const index = buildIndex(report);
const selectors = createSelectors(report, index);

const container = document.getElementById('root');
if (!container) {
  throw new Error('Missing #root element for renderer dev entrypoint.');
}

createRoot(container).render(
  <App summary={selectors.getSummary()} suiteTree={selectors.getSuiteTree()} />
);
