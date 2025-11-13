import { ChakraProvider } from '@chakra-ui/react';
import { Provider, useDispatch } from 'react-redux';
import { store, hydrate, saveAuthToStorage, loadAuthFromStorage } from '../lib/store';
import NavBar from '../src/components/NavBar';
import { useEffect, PropsWithChildren } from 'react';
import type { AppProps } from 'next/app';

function Bootstrapper({ children }: PropsWithChildren) {
  const dispatch = useDispatch();
  useEffect(() => {
    const saved = loadAuthFromStorage();
    if (saved) dispatch(hydrate(saved));
    const unsubscribe = store.subscribe(() => saveAuthToStorage(store.getState));
    return () => unsubscribe();
  }, [dispatch]);
  return children as JSX.Element;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <Bootstrapper>
          <NavBar />
          <Component {...pageProps} />
        </Bootstrapper>
      </ChakraProvider>
    </Provider>
  );
}
