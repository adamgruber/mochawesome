import type { SuiteTreeItem } from '../../domain';
import type { CSSProperties } from 'react';

export type SuiteTreeScreenProps = {
  tree: SuiteTreeItem;
};

const SuiteNode = ({ node, depth }: { node: SuiteTreeItem; depth: number }) => {
  const style = { '--depth': depth } as CSSProperties;
  const title = node.title || 'Root';

  return (
    <div className="suite-tree__node" style={style}>
      <div className="suite-tree__row">
        <div className="suite-tree__title">{title}</div>
        <div className="suite-tree__counts">
          <span className="pill pill--pass">{node.counts.passes} pass</span>
          <span className="pill pill--fail">{node.counts.failures} fail</span>
          <span className="pill pill--warn">{node.counts.pending} pend</span>
          <span className="pill pill--info">{node.counts.skipped} skip</span>
        </div>
      </div>
      {node.children.map(child => (
        <SuiteNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export const SuiteTreeScreen = ({ tree }: SuiteTreeScreenProps) => (
  <section className="suite-tree">
    <div className="suite-tree__header">
      <h2 className="suite-tree__title">Suite Tree</h2>
      <p className="suite-tree__subtitle">Navigate structure and outcomes.</p>
    </div>
    <SuiteNode node={tree} depth={0} />
  </section>
);
