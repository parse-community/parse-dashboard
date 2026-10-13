import { useEffect } from 'react';
import { amplitudeLogEvent } from './amplitudeEvents';

// Free -> paid funnel for the Backend product:
// gate viewed -> gate clicked -> checkout opened -> (closed | At Checkout - Subscription Successful).
// Prefixed with baas_ so the Agent's upgrade_* charts keep counting only the Agent.
export const UpgradeEvent = {
  GATE_VIEWED: 'baas_upgrade_gate_viewed',
  GATE_CLICKED: 'baas_upgrade_gate_clicked',
  CHECKOUT_OPENED: 'baas_checkout_opened',
  CHECKOUT_CLOSED: 'baas_checkout_closed',
};

// The paid feature that made the user hit the paywall. Also sent as ?gate= to plan-usage
// so the checkout events there know where the user came from.
export const UpgradeGate = {
  WEB_HOSTING: 'web_hosting',
  CUSTOM_DOMAIN: 'custom_domain',
  EMAIL_TEMPLATES: 'email_templates',
  PARSE_OPTIONS: 'parse_options',
  JOBS: 'jobs',
  COLLABORATORS: 'collaborators',
  MONGODB_8: 'mongodb_8',
  DB_PROFILER: 'db_profiler',
  OVERVIEW_PLAN_CARD: 'overview_plan_card',
  OVERVIEW_PLAN_BADGE: 'overview_plan_badge',
  OVERVIEW_WEB_HOSTING: 'overview_web_hosting',
  HTTPS: 'https',
  COMPLIANCE_HIPAA: 'compliance_hipaa',
  COMPLIANCE_SOC2: 'compliance_soc2',
  COMPLIANCE_ISO27001: 'compliance_iso27001',
};

export const planUsagePath = (slug, gate) => `/apps/${slug}/plan-usage?gate=${gate}`;

export const getGateFromSearch = (search) => {
  try {
    return new URLSearchParams(search || '').get('gate') || null;
  } catch (e) {
    return null;
  }
};

export const logGateClicked = (gate, appId) =>
  amplitudeLogEvent(UpgradeEvent.GATE_CLICKED, { gate, app_id: appId });

// Renders nothing; logs baas_upgrade_gate_viewed once when the paywall is shown.
export const UpgradeGateView = ({ gate, appId }) => {
  useEffect(() => {
    amplitudeLogEvent(UpgradeEvent.GATE_VIEWED, { gate, app_id: appId });
  }, [gate, appId]);
  return null;
};
