import React from 'react';
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  KBarResults,
  useMatches,
  Action,
} from 'kbar';
import cx from 'classnames';

import 'styles/kbar.scss';

const renderItem = ({ item, active }: { item: string | Action; active: boolean }) => {
  if (typeof item === 'string') return <div className="kbar-section">{item}</div>;
  return <div className={cx('kbar-item kbar-padding', { active: active })}>{item.name}</div>;
};

const KBar = () => {
  const { results } = useMatches();

  return (
    <KBarPortal>
      <KBarPositioner>
        <KBarAnimator className="kbar-bg">
          <label htmlFor="kbar-search" className="sr-only">
            Type a command or search
          </label>
          <KBarSearch id="kbar-search" className="kbar-input" />
          <KBarResults items={results} onRender={renderItem} />
          <footer className="kbar-footer kbar-padding">
            Arrow keys to navigate, Enter to select
          </footer>
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
};

const Provider = ({ children }: { children: React.ReactNode }) => {
  const actions: Action[] = [];

  return (
    <KBarProvider actions={actions}>
      <KBar />
      {children}
    </KBarProvider>
  );
};

export default Provider;
