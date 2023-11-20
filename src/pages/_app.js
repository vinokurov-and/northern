import { ThemeProvider } from "../core/ui/ThemeProvider";
import "../screens/GamesAnnouncmentGames/GamesAnnouncmentGames.css";
import "../styles/styles.css";

function MyApp({ Component, pageProps }) {
    return <ThemeProvider>
            <Component {...pageProps} />
        </ThemeProvider>;
  }


  export default MyApp;