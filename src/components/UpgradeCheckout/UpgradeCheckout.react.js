import React, { useContext, useEffect, useRef, useState } from 'react';
import Popover from 'components/Popover/Popover.react';
import Position from 'lib/Position';
import Button from 'components/Button/Button.react';
import Icon from 'components/Icon/Icon.react';
import AccountManager from 'lib/AccountManager';
import { CurrentApp } from 'context/currentApp';
import { amplitudeLogEvent } from 'lib/amplitudeEvents';
import { UpgradeEvent, UpgradeGate, UpgradeGateView, logGateClicked, planUsagePath } from 'lib/upgradeEvents';
import { Cycle, initPaddle, paddlePlanId, paddlePriceId, recordSubscription } from 'lib/paddleCheckout';
import { prices } from 'dashboard/AppPlan/AppPlan.react';
import styles from './UpgradeCheckout.scss';

const CHECKOUT_FRAME_CLASS = 'upgrade-checkout-frame';
const ORIGIN = new Position(0, 0);
const SUPPORT_TICKET_URL = 'https://help.back4app.com/hc/en-us/requests/new';

// Follows the OS/browser light or dark preference. Read once: Paddle cannot switch theme after opening.
const prefersDark = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const MVP_AS_A_WHOLE = {
  plan: 'MVP',
  headline: 'Take this app to production',
  subline: 'Web hosting and your own domain, daily backups, the latest MongoDB and your team in the app.',
};

// What the user asked for when they hit the paywall, and the cheapest plan that unlocks it.
const GATE_OFFERS = {
  [UpgradeGate.WEB_HOSTING]: { plan: 'MVP', headline: 'Host your pages and use your own domain' },
  [UpgradeGate.OVERVIEW_WEB_HOSTING]: { plan: 'MVP', headline: 'Host your pages and use your own domain' },
  [UpgradeGate.CUSTOM_DOMAIN]: { plan: 'MVP', headline: 'Put your API and pages on your own domain' },
  [UpgradeGate.EMAIL_TEMPLATES]: { plan: 'MVP', headline: 'Send emails with your brand and words' },
  [UpgradeGate.PARSE_OPTIONS]: { plan: 'MVP', headline: 'Tune your Parse Server' },
  [UpgradeGate.COLLABORATORS]: { plan: 'MVP', headline: 'Bring your team into this app' },
  // The overview's generic upgrade entry points: no single feature asked for, so they sell MVP as a whole.
  [UpgradeGate.OVERVIEW_PLAN_CARD]: MVP_AS_A_WHOLE,
  [UpgradeGate.OVERVIEW_PLAN_BADGE]: MVP_AS_A_WHOLE,
  [UpgradeGate.MONGODB_8]: {
    plan: 'MVP',
    headline: 'Get the latest MongoDB',
    subline: 'Faster queries and the newest MongoDB features.',
  },
  // HTTPS on a custom domain is turned on by support after the upgrade.
  [UpgradeGate.HTTPS]: {
    plan: 'Pay As You Go',
    headline: 'Serve your custom domain over HTTPS',
    subline: 'Your domain is on HTTP, so browsers mark it "Not secure".',
    nextStep: 'Next, open a support ticket and our team will enable HTTPS on your domain.',
  },
  [UpgradeGate.COMPLIANCE_SOC2]: { plan: 'Pay As You Go', headline: 'Pass your customer\'s security review', subline: 'SOC 2 Type 2 certified infrastructure.' },
  [UpgradeGate.COMPLIANCE_ISO27001]: { plan: 'Pay As You Go', headline: 'Pass your customer\'s security review', subline: 'ISO 27001 certified infrastructure.' },
  [UpgradeGate.COMPLIANCE_HIPAA]: { plan: 'Dedicated', headline: 'Pass your customer\'s security review', subline: 'HIPAA-ready infrastructure, after a signed BAA.' },
};

const detailText = detail => [detail.number, detail.text].filter(Boolean).join(' ');

const getOwnerEmail = async context => {
  if (context.custom && context.custom.isOwner) {
    return AccountManager.currentUser().email;
  }
  const { ownerEmail } = await context.getAppOwnerEmail();
  return ownerEmail;
};

// Opens the Paddle checkout for the plan that unlocks `gate`, skipping the plan comparison page.
export const UpgradeCheckoutModal = ({ gate, onClose }) => {
  const context = useContext(CurrentApp);
  const offer = GATE_OFFERS[gate];
  const plan = prices.find(p => p.name === offer.plan);

  const [dark] = useState(prefersDark);
  // Monthly only: a paywall sells the plan at its monthly price. Yearly stays on Plan Usage.
  const cycle = Cycle.MONTHLY;
  const [paddle, setPaddle] = useState(null);
  const [ownerEmail, setOwnerEmail] = useState(null);
  const [frame, setFrame] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const funnel = useRef({ app_id: context.applicationId, plan: plan.name, cycle, source: 'gate', gate });
  const opened = useRef(false);

  useEffect(() => {
    let active = true;
    initPaddle(async data => {
      if (data.name === 'checkout.completed') {
        setCompleted(true);
        await recordSubscription(data, { source: 'gate', gate });
      }
    }).then(instance => active && setPaddle(instance || null)).catch(e => active && setError(e));
    getOwnerEmail(context).then(email => active && setOwnerEmail(email)).catch(e => active && setError(e));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!paddle || !ownerEmail || !frame || opened.current) {
      return;
    }
    opened.current = true;
    amplitudeLogEvent(UpgradeEvent.CHECKOUT_OPENED, funnel.current);
    paddle.Checkout.open({
      items: [{ priceId: paddlePriceId(plan, cycle), quantity: 1 }],
      settings: {
        displayMode: 'inline',
        theme: dark ? 'dark' : 'light',
        locale: 'en',
        variant: 'one-page',
        frameTarget: CHECKOUT_FRAME_CLASS,
        frameInitialHeight: '450',
        frameStyle: 'width: 100%; min-width: 312px; background-color: transparent; border: none;',
      },
      customData: { appId: context.applicationId, planId: paddlePlanId(plan, cycle) },
      allowLogout: false,
      customer: { email: ownerEmail },
    });
  }, [paddle, ownerEmail, frame]);

  const close = () => {
    if (completed) {
      // Reload so the paywall that brought the user here reflects the new plan.
      window.location.reload();
      return;
    }
    amplitudeLogEvent(UpgradeEvent.CHECKOUT_CLOSED, funnel.current);
    if (paddle && opened.current) {
      paddle.Checkout.close();
    }
    onClose();
  };

  return (
    <Popover fadeIn={true} fixed={true} position={ORIGIN} modal={true} color="rgba(17,13,17,0.8)">
      <div className={[styles.checkout, dark ? styles.dark : styles.light].join(' ')}>
        <button className={styles.close} onClick={close} aria-label="Close">
          <Icon name="close" width={12} height={12} fill={dark ? '#C3CAD6' : '#4A5568'} />
        </button>
        <div className={styles.summary}>
          <div className={styles.eyebrow}>Upgrade to {plan.name}</div>
          <div className={styles.headline}>{offer.headline}</div>
          {offer.subline ? <div className={styles.subline}>{offer.subline}</div> : null}
          <div className={styles.price}>
            <span className={styles.priceValue}>${plan.pricePerMonth}</span>
            <span className={styles.priceUnit}>/month</span>
          </div>
          <div className={styles.priceNote}>Billed monthly · cancel anytime</div>

          <div className={styles.benefits}>
            {plan.details.map((detail, idx) => (
              <div key={idx} className={styles.benefit}>
                <Icon name="b4a-check-icon" width={12} height={12} fill="#27AE60" />
                <span>{detailText(detail)}</span>
              </div>
            ))}
          </div>

          <div className={styles.total}>
            <span>Total today</span>
            <span>${plan.pricePerMonth} + tax</span>
          </div>

          {completed ? (
            <div className={styles.done}>
              <div>
                You are on {plan.name} now.
                {offer.nextStep ? (
                  <div className={styles.nextStep}>
                    {offer.nextStep}{' '}
                    <a href={SUPPORT_TICKET_URL} target="_blank" rel="noopener noreferrer">Open a ticket</a>
                  </div>
                ) : null}
              </div>
              <Button primary={true} value="Done" onClick={close} />
            </div>
          ) : (
            <a className={styles.comparePlans} href={planUsagePath(context.slug, gate)}>
              Compare all plans
            </a>
          )}
        </div>
        <div className={styles.payment}>
          {error ? (
            <div className={styles.error}>We could not load the checkout. Please refresh the page and try again.</div>
          ) : null}
          <div className={CHECKOUT_FRAME_CLASS} ref={setFrame}></div>
        </div>
      </div>
    </Popover>
  );
};

// Paywall entry point: logs the gate view, and on click opens the direct checkout.
// `renderTrigger(open)` lets anchors and custom buttons keep their look.
export const UpgradeGateButton = ({ gate, renderTrigger, value = 'Upgrade Plan' }) => {
  const context = useContext(CurrentApp);
  const [open, setOpen] = useState(false);
  const openCheckout = event => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    logGateClicked(gate, context.applicationId);
    setOpen(true);
  };

  return (
    <>
      <UpgradeGateView gate={gate} appId={context.applicationId} />
      {renderTrigger ? renderTrigger(openCheckout) : <Button value={value} primary={true} onClick={openCheckout} trackClick={false} />}
      {open ? <UpgradeCheckoutModal gate={gate} onClose={() => setOpen(false)} /> : null}
    </>
  );
};
