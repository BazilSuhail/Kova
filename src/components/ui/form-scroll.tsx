import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';

type Reveal = (target: number | null) => void;

const FormScrollContext = createContext<Reveal | null>(null);

/** Bring a focused field above the software keyboard inside the nearest FormScrollView. */
export function useFieldReveal(): Reveal | null {
  return useContext(FormScrollContext);
}

type Props = ScrollViewProps & { children: ReactNode };

export function FormScrollView({ children, ...rest }: Props) {
  const ref = useRef<ScrollView>(null);

  const reveal = useCallback<Reveal>((target) => {
    if (!target || !ref.current) return;
    (ref.current as ScrollView & {
      scrollResponderScrollNativeHandleToKeyboard?: (
        node: number,
        offset?: number,
        preventNegativeScrollOffset?: boolean,
      ) => void;
    }).scrollResponderScrollNativeHandleToKeyboard?.(target, 96, true);
  }, []);

  const value = useMemo(() => reveal, [reveal]);

  return (
    <FormScrollContext.Provider value={value}>
      <ScrollView ref={ref} {...rest}>
        {children}
      </ScrollView>
    </FormScrollContext.Provider>
  );
}
