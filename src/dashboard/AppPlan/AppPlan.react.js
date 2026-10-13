/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import AccountManager from 'lib/AccountManager';
import React from 'react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import { withRouter } from 'lib/withRouter';
import DashboardView from 'dashboard/DashboardView.react';
import B4aLoaderContainer from 'components/B4aLoaderContainer/B4aLoaderContainer.react';
import styles from './AppPlan.scss';
import EmptyGhostState from 'components/EmptyGhostState/EmptyGhostState.react';
import Button from 'components/Button/Button.react';
import { getUsageClassName, formatDate } from './usageClassUtils';
import B4aToggle from 'components/Toggle/B4aToggle.react';
import Icon from 'components/Icon/Icon.react';
import { initializePaddle } from '@paddle/paddle-js';
import B4aModal from 'components/B4aModal/B4aModal.react';
import { amplitudeLogEvent } from 'lib/amplitudeEvents';
import { UpgradeEvent, getGateFromSearch } from 'lib/upgradeEvents';

const prices = [
  {
    id: 0,
    name: 'MVP',
    desc: 'Validate Ideas Quickly — Launch Fast on Our Managed Serverless Backend',
    pricePerMonth: '25',
    monthlyPlanId: 'gXGhzlMHZ6',
    monthlyProductId: 'pri_01jjyr3kxmsav875y1v2p8h68k',
    pricePerYear: '15',
    annuallyPlanId: 'nUAySI815X',
    annuallyProductId: 'pri_01jjyr5r3ayqcs5cr58bm5b4rw',
    priceTag: 'Per App / Month',
    savePercent: '40%',
    details: [
      {
        text: 'Web hosting & custom domain',
      },
      {
        text: 'Daily Backups',
      },
      {
        text: 'Latest MongoDB',
      },
      {
        text: 'Custom email templates',
      },
      {
        number: 'Up to 3',
        text: 'collaborators',
      },
      {
        number: '500 K',
        text: 'Requests',
      },
      {
        number: '1 GB',
        text: 'Data Storage',
      },
      {
        number: '250 GB',
        text: 'Data Transfer',
      },
      {
        number: '50 GB',
        text: 'File Storage',
      },
    ],
    icon: 'b4a-mvp-plan-icon',
    greenText: 'Go live with your own domain'
  },
  {
    id: 1,
    name: 'Pay As You Go',
    desc: 'Run & Scale Applications on a Serverless Infrastructure',
    pricePerMonth: '100',
    monthlyPlanId: '7xWmyzNUvZ',
    monthlyProductId: 'pri_01jjyr4fs9j1926g5tv54jvs0h',
    pricePerYear: '80',
    annuallyPlanId: 'YfX9ryk4UH',
    annuallyProductId: 'pri_01jjyr4zj8dzg88xf82mtrnk6k',
    priceTag: 'Per App / Month',
    savePercent: '20%',
    details: [
      {
        number: '5 M',
        text: 'Requests',
      },
      {
        number: '3 GB',
        text: 'Data Storage',
      },
      {
        number: '1 TB',
        text: 'Data Transfer',
      },
      {
        number: '250 GB',
        text: 'File Storage',
      },
      {
        text: 'Daily Backups',
      },
      {
        text: 'HTTPS on your custom domain',
      },
      {
        text: 'SOC 2 and ISO 27001',
      },
    ],
    icon: 'b4a-pay-as-you-go-plan-icon',
    greenText: '200x more requests'
  },
  {
    id: 2,
    name: 'Dedicated',
    desc: 'Production-Grade Speed, Isolation & Flexibility on Dedicated Resources',
    pricePerMonth: '500',
    monthlyPlanId: 'VGaDTCDNbi',
    pricePerYear: '400',
    monthlyProductId: 'pri_01jjyrqff5wb1pkcekge3ddrtz',
    annuallyPlanId: 'U8nRA9rxdD',
    annuallyProductId: 'pri_01jjyrsbcexqvqzsjvby0ykw2h',
    priceTag: 'Per App / Month',
    savePercent: '20%',
    details: [
      {
        text: 'Unlimited Requests',
      },
      {
        number: '10 CPUs / 14 GB',
      },
      {
        number: '8 GB',
        text: 'Data Storage',
      },
      {
        number: '2 TB',
        text: 'Data Transfer',
      },
      {
        number: '1 TB',
        text: 'File Storage',
      },
      {
        text: 'Point-in-Time Backups',
      },
      {
        text: 'SOC 2 and ISO 27001',
      },
      {
        text: 'HIPAA After BAA Signed',
      },
    ],
    icon: 'b4a-dedicated-plan-icon',
    greenText: 'Unlimited requests'
  },
];

@withRouter
class AppPlan extends DashboardView {
  constructor() {
    super();
    this.section = 'Plan Usage';
    this.state = {
      isLoadingAppPlanData: true,
      appPlanData: null,
      appPlanName: 'Free Plan',
      appPlanError: null,
      selectedPlan: prices[1],
      billingCycle: 0, // 0 --> monthly || 1 --> yearly
      isLoadingPaddle: false,
      paddleError: null,
      paddle: null,
      appOwnerEmail: null,
      openCheckout: false
    };
    this.onRefresh = this.onRefresh.bind(this);
    this.handleOnClickPlan = this.handleOnClickPlan.bind(this);
  }

  componentWillMount() {
    this.loadData();
    this.loadPaddle();
    this.getAppOwnerEmail();
  }

  componentDidUnmount() {
    this.setState({ openCheckout: false });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      // check if the changes are in currentApp serverInfo status
      // if not return without making any request
      if (this.props.apps !== nextProps.apps) {
        const updatedCurrentApp = nextProps.apps.find(ap => ap.slug === this.props.match.params.appId);
        const prevCurrentApp = this.props.apps.find(ap => ap.slug === this.props.match.params.appId);
        const shouldUpdate = updatedCurrentApp.serverInfo.status !== prevCurrentApp.serverInfo.status;
        if (!shouldUpdate) {return;}
      }
      // nextProps.config.dispatch(ActionTypes.FETCH);
    }
  }

  onRefresh() {
    this.loadData();
  }

  loadData() {
    this.context.getAppPlanData().then(res => this.setState({
      isLoadingAppPlanData: false,
      appPlanData: res,
      appPlanName: res.planName
    })).catch(err => this.setState({
      isLoadingAppPlanData: false,
      appPlanData: new Error(err.message || err.msg || 'Something went wrong')
    }));
  }

  loadPaddle() {
    const paddleOptions = {
      token: b4aSettings.PADDLE_TOKEN || 'test_0270ab179b4f4abd7aa228c7014',
      environment: process.env.SENTRY_ENV === 'production' ? 'production' : 'sandbox',
      pwCustomer: {}
    }

    // Paddle calls this as a plain function, so keep a handle on the component for the funnel context.
    const component = this;
    const paddleEventCallback = async function (data) {
      if (data.name === 'checkout.completed') {
        component.checkoutCompleted = true;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'paddle_purchase',
          value: Number(data.data.totals.total),
          currency: data.data.currency_code,
          transaction_id: data.data.transaction_id
        });

        const paymentData = {
          appId: data.data.custom_data.app_id,
          customerId: data.data.customer.id,
          planName: data.data.items[0].product.name,
          transactionId: data.data.transaction_id,
          checkoutId: data.data.id,
          results: data.data,
          planId: data.data.custom_data.plan_id,
          email: data.data.customer.email,
        };

        // confirm its value in homolog
        await fetch(`${b4aSettings.BACK4APP_CHECKOUT_URL}/save-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });

        // Amplitude event for successful checkout
        try {
          const amplitudePayload = {
            api_key: b4aSettings.BACK4APP_AMPLITUDE_KEY,
            events: [
              {
                user_id: paymentData.email || 'unknown',
                event_type: 'At Checkout - Subscription Successful',
                time: Date.now(),
                event_properties: {
                  appId: paymentData.appId,
                  planName: paymentData.planName,
                  planType: data.data.items[0].billing_cycle.interval,
                  subscriptionTotal: data.data.totals.total,
                  source: component.checkoutContext?.source,
                  gate: component.checkoutContext?.gate,
                }
              }
            ]
          };
          await fetch('https://api.amplitude.com/2/httpapi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(amplitudePayload)
          });
        } catch (error) {
          console.log('Amplitude error (checkout.completed):', error);
        }
      }
      if (data.name === 'checkout.closed') {
        window.location.href = `${b4aSettings.BACKEND_DASHBOARD_PATH}/apps/${this.context.appId}/plan-usage`;
      }
    }

    initializePaddle({ ...paddleOptions, eventCallback: paddleEventCallback }).then(
      (paddleInstance) => {
        if (paddleInstance) {
          this.setState({ paddle: paddleInstance });
        }
      },
    );
  }

  async getAppOwnerEmail() {
    let appOwnerEmail;
    if (!this.context.custom.isOwner) {
      const { ownerEmail } = await this.context.getAppOwnerEmail();
      appOwnerEmail = ownerEmail;
    } else {
      appOwnerEmail = AccountManager.currentUser().email;
    }
    this.setState({ appOwnerEmail });
  }

  renderToolbar() {
    return (
      <Toolbar section="Plan Usage">
        {/* <a className={browserStyles.toolbarButton} style={{ margin: 0, border: 'none' }} onClick={this.onRefresh.bind(this)}>
          <Icon name="b4a-refresh-icon" width={18} height={18} />
        </a> */}
      </Toolbar>
    );
  }

  async getPriceId(planId) {
    try {
      const response = await fetch(`https://${b4aSettings.BACK4APP_CHECKOUT_URL}/functions/getPriceId?planId=${planId}`, {
        method: 'POST',
        headers: {
          'x-parse-application-id': b4aSettings.CHECKOUT_APPLICATION_ID,
          'x-parse-rest-api-key': b4aSettings.CHECKOUT_REST_API_KEY,
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching priceId', error);
      this.setState({ paddleError: error });
    }
  }

  async handleOnClickPlan(plan) {
    const gate = getGateFromSearch(this.props.location?.search);
    this.checkoutContext = {
      app_id: this.context.applicationId,
      plan: plan.name,
      cycle: this.state.billingCycle === 0 ? 'monthly' : 'yearly',
      source: gate ? 'gate' : 'plan_page',
      gate,
    };
    this.checkoutCompleted = false;
    amplitudeLogEvent(UpgradeEvent.CHECKOUT_OPENED, this.checkoutContext);
    this.setState({ selectedPlan: plan, openCheckout: true }, () => {
      const priceId = this.state.billingCycle === 0 ? plan.monthlyPlanId : plan.annuallyPlanId;
      const productId = this.state.billingCycle === 0 ? plan.monthlyProductId : plan.annuallyProductId;
      this.state.paddle?.Checkout.open({
        items: [{ priceId: process.env.SENTRY_ENV === 'production' ? productId : 'pri_01jjykwj65y5de1vcv5xaryw8g', quantity: 1 }],
        title: plan.name,
        settings: {
          displayMode: 'inline',
          theme: 'light',
          locale: 'en',
          variant: 'one-page',
          frameTarget: 'checkout-container',
          frameInitialHeight: '450',
          frameStyle: 'width: 100%; min-width: 312px; max-height: 80vh; background-color: #f9f9f9; border: none;'
        },
        customData: { appId: this.context.applicationId, planId: priceId },
        allowLogout: false,
        customer: {
          email: this.state.appOwnerEmail,
        }
      });
    });
  }

  renderContent() {
    const toolbar = this.renderToolbar();

    const loading = this.state.isLoadingAppPlanData;
    const planData = this.state.appPlanData;
    const { selectedPlan, billingCycle } = this.state;
    const currenUser = AccountManager.currentUser().email;

    let content = null;
    if (loading) {
      content = null;
    } else if (planData instanceof Error || this.state.appPlanError) {
      content = <EmptyGhostState
        title="Something went wrong"
        description={'Please try again later.'}
        cta="Refresh"
        action={this.onRefresh}
      />
    } else {
      content = <div className={styles.mainContent}><div className={styles.wrapper}>
        <div className={styles.header}>Plan Usage</div>
        <div className={styles.headerSubText}>Track your resource utilization across all features to optimize your app and plan allocation.</div>
        <div className={styles.planUsage}>
          <div className={styles.planUsageHeader}>
            <div className={styles.planNameChip}>{planData.planName}</div>
            <div className={styles.planDates}>
              <div className={styles.planDate}>Valid until: <span className={styles.planDateValue}>{formatDate(planData.planValid)}</span></div>
              <div className={styles.planDate}>Last Update: <span className={styles.planDateValue}>{formatDate(planData.planLastUpdate)}</span></div>
            </div>
          </div>
          <div className={styles.planUsageDetails}>
            <div className={styles.usageLimitsCard}>
              <table className={styles.usageLimitsTable}>
                <thead>
                  <tr>
                    <th className={styles.usageLimitsHeader}>Usage & Limits</th>
                    <th className={styles.usageLimitsHeader}>Used</th>
                    <th className={styles.usageLimitsHeader}>Included</th>
                  </tr>
                </thead>
                <tbody>
                  {/* <tr>
                    <td>Requests/second</td>
                    <td>(N.A.)</td>
                    <td>{planData.apiCallPerSecondLimit}</td>
                  </tr> */}
                  <tr>
                    <td>Total Requests/Month</td>
                    <td className={getUsageClassName(planData.apiCallUsed, planData.apiCallLimit) ? styles[getUsageClassName(planData.apiCallUsed, planData.apiCallLimit)] : undefined}>{planData.apiCallUsed}</td>
                    <td>{planData.apiCallLimit}</td>
                  </tr>
                  <tr>
                    <td>File Storage</td>
                    <td className={getUsageClassName(planData.fileStorageUsed, planData.fileStorageLimit) ? styles[getUsageClassName(planData.fileStorageUsed, planData.fileStorageLimit)] : undefined}>{planData.fileStorageUsed}</td>
                    <td>{planData.fileStorageLimit}</td>
                  </tr>
                  <tr>
                    <td>Database Storage</td>
                    <td className={getUsageClassName(planData.dataStorageUsed, planData.dataStorageLimit) ? styles[getUsageClassName(planData.dataStorageUsed, planData.dataStorageLimit)] : undefined}>{planData.dataStorageUsed}</td>
                    <td>{planData.dataStorageLimit}</td>
                  </tr>
                  <tr>
                    <td>Cloud Code Jobs</td>
                    <td>(N.A.)</td>
                    <td>{planData.maxJobAmount == 1000 ? 'Unlimited' : planData.maxJobAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.upgradeCard}>
              <div className={styles.upgradeCardHeader}>
                <div className={styles.upgradeCardTitle}>Ready to Scale?</div>
              </div>
              <div className={styles.upgradeCardSubText}>Go live with your own domain, backups and a modern database</div>

              <div className={styles.upgradeFeatures}>
                <div className={styles.upgradeFeaturesTitle}>WHAT YOU GET:</div>
                <div className={styles.upgradeFeaturesList}>
                  <div className={styles.upgradeFeature}>
                    <span className={styles.planName}>MVP:</span> Web hosting & custom domain, daily backups, latest MongoDB, email templates and collaborators
                  </div>
                  <div className={styles.upgradeFeature}>
                    <span className={styles.planName}>Pay-as-you-Go:</span> SOC 2 and ISO 27001-certified infrastructure
                  </div>
                  <div className={styles.upgradeFeature}>
                    <span className={styles.planName}>Dedicated:</span> Point-in-time restore & HIPAA-ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.prices}>
          <div className={styles.pricesHeader}>
            <div className={styles.pricesHeaderTitle}>Choose your plan</div>
            <div className={styles.priceDescription}>Compare all available plans and find the perfect fit for your application needs.</div>
            <B4aToggle
              type={B4aToggle.Types.CUSTOM}
              value={billingCycle === 0 ? 'Monthly' : 'Yearly'}
              optionLeft="Yearly"
              optionRight="Monthly"
              labelLeft="Yearly"
              labelRight="Monthly"
              onChange={level => {
                this.setState({
                  billingCycle: level === 'Yearly' ? 1 : 0,
                })
              }}
            />
          </div>
          <div className={styles.priceList}>
            {prices.map((plan, idx) => (
              <PriceCard key={idx} plan={plan} active={selectedPlan.id === plan.id} cycle={billingCycle} onClick={this.handleOnClickPlan.bind(this)} />
            ))}
          </div>
        </div>

        {this.state.appPlanName && this.state.appPlanName.indexOf('Free') < 0 && this.state.appPlanName.indexOf('Public') < 0 && (
          <div className={styles.cancelPlanContainer}>
            <div className={styles.cancelPlanText}>
              <div className={styles.cancelPlanHeader}>Cancel Plan</div>
              <div className={styles.cancelPlanSubText}>By canceling your plan, you’ll lose access to premium features, which may impact your app’s performance and data backups.</div>
            </div>
            <a href={`https://back4app.typeform.com/to/F9OPnK?appid=${this.context.applicationId}&appname=${this.context.name}&useremail=${currenUser}`} target="_blank" className={styles.cancelPlanButton}>
              Cancel Plan
            </a>
          </div>
        )}

      </div></div>
    }

    return (
      <div>
        <B4aLoaderContainer loading={loading}>
          <div className={styles.content}>
            {content}
          </div>
        </B4aLoaderContainer>
        {toolbar}

        {this.state.openCheckout ? (
          <B4aModal
            type={B4aModal.Types.DEFAULT}
            width={'80vw'}
            customFooter={<div></div>}
            onCancel={() => {
              if (!this.checkoutCompleted) {
                amplitudeLogEvent(UpgradeEvent.CHECKOUT_CLOSED, this.checkoutContext);
              }
              this.setState({ openCheckout: false });
            }}
          >
            <div className="checkout-container"></div>
          </B4aModal>
        ) : null}
      </div>
    );
  }
}

export default AppPlan;


const PriceCard = ({ plan, active, cycle, onClick }) => {
  const { name, pricePerMonth, pricePerYear, details, greenText } = plan;

  const price = cycle === 0 ? pricePerMonth : pricePerYear;

  return (
    <div className={`${styles.priceCard} ${active ? styles.activePriceCard : ''}`}>
      {plan.id === 1 ? <span className={styles.mostPopular}>Most Popular</span> : null}
      <div className={styles.priceName}>{name} <span className={styles.greenText}>{greenText}</span></div>
      <div className={styles.planPrice}>
        <span className={styles.planPriceValue}>${price}</span>
        <span className={styles.planPriceCycle}>per App / Month</span>
        {cycle ? <span className={styles.planPriceSave}>Save {plan.savePercent}</span> : null}
        <span className={styles.planPriceCycle}>Billed {cycle ? 'Yearly' : 'Monthly'}</span>
      </div>
      <div className={styles.planDetails}>
        {details.map((detail, idx) => (
          <div key={idx} className={styles.planDetailText}>
            <Icon name='b4a-check-icon' width={12} height={12} fill='#f9f9f9' />
            <span> <span style={{ fontWeight: 600 }}>{detail.number}</span> {detail.text}</span>
          </div>
        ))}
      </div>
      <Button className={`${styles.upgradeBnt} ${active ? styles.activeButton : styles.inactiveButton}`} value={`Choose ${name}`} onClick={() => onClick(plan)} />
    </div>
  );
};

export {
  prices,
}