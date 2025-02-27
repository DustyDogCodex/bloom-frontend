import { useRouter } from 'next/router';
import Script from 'next/script';
import { useEffect } from 'react';
import { RootState } from '../../app/store';
import { CHAT_MESSAGE_SENT, CHAT_STARTED, FIRST_CHAT_STARTED } from '../../constants/events';
import { useTypedSelector } from '../../hooks/store';
import logEvent, { getEventUserData } from '../../utils/logEvent';
import { createCrispProfileData } from './utils/createCrispProfileData';

const CrispScript = () => {
  const { user, partnerAccesses, partnerAdmin, courses } = useTypedSelector(
    (state: RootState) => state,
  );
  const router = useRouter();
  const locale = router.locale;

  const eventData = getEventUserData({ user, partnerAccesses, partnerAdmin });

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === 'production') {
      (window as any).$crisp.push(['safe', true]);
    }
    (window as any).$crisp.push([
      'on',
      'chat:initiated',
      () => {
        logEvent(FIRST_CHAT_STARTED, eventData);
      },
    ]);
    (window as any).$crisp.push([
      'on',
      'message:sent',
      () => {
        logEvent(CHAT_MESSAGE_SENT, eventData);
      },
    ]);
    (window as any).$crisp.push([
      'on',
      'chat:opened',
      () => {
        logEvent(CHAT_STARTED, eventData);
      },
    ]);
  }, []);

  useEffect(() => {
    const hasLiveAccess =
      partnerAccesses.length === 0
        ? true
        : partnerAccesses.find((partnerAccess) => partnerAccess.featureLiveChat === true);
    if (user.email && hasLiveAccess) {
      (window as any).CRISP_TOKEN_ID = user.crispTokenId;
      (window as any).$crisp.push(['do', 'session:reset']);
      (window as any).$crisp.push(['set', 'user:email', [user.email]]);
      const segments =
        partnerAccesses.length > 0
          ? partnerAccesses.map((pa) => pa.partner.name.toLowerCase())
          : ['public'];
      (window as any).$crisp.push(['set', 'session:segments', [segments]]);
      (window as any).$crisp.push([
        'set',
        'session:data',
        [createCrispProfileData(partnerAccesses, courses)],
      ]);

      (window as any).$crisp.push(['do', 'chat:show']);
    } else {
      (window as any).$crisp.push(['do', 'chat:hide']);
    }
  }, [user, partnerAccesses]);

  const crispScriptUrl = 'https://client.crisp.chat/l.js';

  return (
    <Script
      id="crisp-widget"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
            window.$crisp=[];
            CRISP_RUNTIME_CONFIG = {
              locale : ${router.locale ? `"${router.locale}"` : 'en'}
            };
            window.CRISP_WEBSITE_ID="${process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID}";
            (function(){
              const d = document;
              const s = d.createElement("script");
              s.src = "${crispScriptUrl}";
              s.async = 1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();`,
      }}
    />
  );
};

export default CrispScript;
