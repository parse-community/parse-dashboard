import DashboardView from 'dashboard/DashboardView.react';
import Button from 'components/Button/Button.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Label from 'components/Label/Label.react';
import React from 'react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import LoaderContainer from 'components/LoaderContainer/LoaderContainer.react';
import styles from './Security.scss';
import Field from 'components/Field/Field.react';
import Fieldset from 'components/Fieldset/Fieldset.react';
import Parse from 'parse';

export default class Security extends DashboardView {
  constructor() {
    super();
    this.section = 'App Settings';
    this.subsection = 'Security';
    this.state = {
      loading: false,
      data: {},
      error: '',
    };
  }

  componentWillMount() {
    this.reload();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      this.reload();
    }
  }

  renderToolbar() {
    return (
      <Toolbar section="Settings" subsection="Security">
        <Button color="white" value="Reload" onClick={() => this.reload()} />
      </Toolbar>
    );
  }

  renderDiv() {
    if (this.state.error) {
      return <EmptyState title="Security" description={<span>{this.state.error}</span>} icon="gears" cta="Reload" action={() => this.reload()} />;
    }
    if (this.state.loading) {
      return (
        <LoaderContainer loading={this.state.loading}>
          <div style={{ minHeight: '100vh' }} className={styles.content} />
        </LoaderContainer>
      );
    }
    return (
      <div>
        <Fieldset legend="Result">
          <Field labelWidth={30} label={<Label text="Status" />} input={<Label text={this.state.data.state} style={{ color: this.state.data.state === 'fail' ? 'red' : 'green' }} />} />
          <Field labelWidth={30} label={<Label text="Version" />} input={<Label text={this.state.data.version} />} />
        </Fieldset>
        {this.state.data.groups &&
          this.state.data.groups.map((check) => (
            <Fieldset legend={check.name} key={JSON.stringify(check)}>
              <Field labelWidth={30} label={<Label text="Status" />} input={<Label text={check.state} style={{ color: check.state === 'fail' ? 'red' : '' }} />} />
              {check.checks.map((subCheck) => (
                <Field
                  key={JSON.stringify(subCheck)}
                  label={<Label text={subCheck.title} />}
                  labelWidth={30}
                  input={
                    <Label
                      text={
                        <div className={styles.state} style={{ color: subCheck.state === 'fail' ? 'red' : 'green' }}>
                          {subCheck.state}
                        </div>
                      }
                      description={
                        <div className={styles.result}>
                          <div>{subCheck.warning}</div>
                          <Label text={subCheck.solution} />
                        </div>
                      }
                    />
                  }
                />
              ))}
            </Fieldset>
          ))}
      </div>
    );
  }

  renderContent() {
    return (
      <div className={styles.content}>
        {this.renderToolbar()}
        {this.renderDiv()}
      </div>
    );
  }

  async reload() {
    this.setState({ loading: true });
    const result = await Parse._request('GET', 'security', {}, { useMasterKey: true }).catch((e) => {
      this.setState({ error: e?.message || e });
    });
    this.setState({ loading: false, data: result?.report || {} });
  }
}
