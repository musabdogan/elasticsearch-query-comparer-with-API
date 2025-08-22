import '../styles/global.css';
import { EuiProvider } from '@elastic/eui';

export default function MyApp({ Component, pageProps }) {
  return (
    <EuiProvider>
      <Component {...pageProps} />
    </EuiProvider>
  );
} 