import { useEffect } from "react";
import { useRouter } from "next/router";
import { ThemeProvider } from "../core/ui/ThemeProvider";
import { trackPageView } from "../utils/analytics";
import "../screens/GamesAnnouncmentGames/GamesAnnouncmentGames.css";
import "../styles/styles.css";

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        trackPageView();
        const handleRouteChange = (url) => trackPageView(url);
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    return <ThemeProvider>
            <Component {...pageProps} />
        </ThemeProvider>;
  }


  export default MyApp;
