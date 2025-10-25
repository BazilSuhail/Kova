import { useEffect, useRef, type ReactNode } from 'react';
import PagerView from 'react-native-pager-view';

type Props = {
  page: number;
  onPageChange: (page: number) => void;
  children: ReactNode[];
};

/** Native swipeable pager. The web build uses intro-pager.web.tsx (pager-view has no web view). */
export function IntroPager({ page, onPageChange, children }: Props) {
  const ref = useRef<PagerView>(null);
  const shown = useRef(page);

  useEffect(() => {
    if (shown.current !== page) {
      shown.current = page;
      ref.current?.setPage(page);
    }
  }, [page]);

  return (
    <PagerView
      ref={ref}
      style={{ flex: 1 }}
      initialPage={page}
      onPageSelected={(event) => {
        shown.current = event.nativeEvent.position;
        onPageChange(event.nativeEvent.position);
      }}
    >
      {children}
    </PagerView>
  );
}
