import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script';

export default function Document() {
    return (
        <Html>
            <Head>
                <meta name="yandex-verification" content="f7f1b9fa4e224a3e" />
                <meta name="google-site-verification" content="W9OraKsF8yYm8r_nIMDAQUU-XTlRiXhvpb4ERSzABO4" />
            </Head>
            <body>
                <Main />
                <NextScript />
                <Script id="metrika-counter" strategy="afterInteractive">
                    {`
                                (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                                m[i].l=1*new Date();
                                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                                (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
           
                                ym(79204078, "init", {
                                     clickmap:true,
                                     trackLinks:true,
                                     accurateTrackBounce:true,
                                     webvisor:true
                                });
                                `
                    }
                </Script>
            </body>
        </Html>
    )
}