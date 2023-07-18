import TableView from 'dashboard/TableView.react';
import Button from 'components/Button/Button.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import React from 'react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import styles from './Security.scss';
import Parse from 'parse';
import TableHeader from 'components/Table/TableHeader.react';

export default class Security extends TableView {
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

  renderRow(security) {
    return (
      <tr key={JSON.stringify(security)}>
        <td className={styles.tableData} style={security.header ? {fontWeight: 'bold'} : {}}  width={'20%'}>
          {security.check}
        </td>
        <td className={styles.tableData} width={'5%'}>
          {security.i !== undefined ? '' : (security.status === 'success' ? '✅' : '❌')}
        </td>
        <td className={styles.tableData} width={'37.5%'}>
          {security.issue}
        </td>
        <td className={styles.tableData}  width={'37.5%'}>
          {security.solution}
        </td>
      </tr>
    );
  }

  renderHeaders() {
    return [
      <TableHeader width={20} key="Check">
        Check
      </TableHeader>,
      <TableHeader width={5} key="Status">
        Status
      </TableHeader>,
      <TableHeader width={37.5} key="Issue">
        Issue
      </TableHeader>,
      <TableHeader width={37.5} key="Solution">
        Solution
      </TableHeader>,
    ];
  }

  renderEmpty() {
    return <EmptyState title="Security" description={<span>{this.state.error}</span>} icon="gears" cta="Reload" action={() => this.reload()} />;
  }

  tableData() {
    const data = [];
    if (this.state.data.state) {
      data.push({
        check: 'Overall status',
        status: this.state.data.state,
        header: true
      }),
      data.push({i: -1})
    }
    for (let i = 0; i < this.state.data?.groups?.length; i++) {
      const group = this.state.data.groups[i]
      data.push({
        check: group.name,
        status: group.state,
        issue: '',
        solution: '',
        header: true
      });
      for (const check of group.checks) {
        data.push({
          check: check.title,
          status: check.state,
          issue: check.warning,
          solution: check.solution,
        });
      }
      if (i !== this.state.data.groups.length - 1) {
        data.push({i});
      }
    }
    return data;
  }

  async reload() {
    if (!this.context.enableSecurityChecks) {
      this.setState({ error: 'Enable Dashboard option `enableSecurityChecks` to run security check.' });
      return;
    }
    this.setState({ loading: true });
    const result = await Parse._request('GET', 'security', {}, { useMasterKey: true }).catch((e) => {
      this.setState({ error: e?.message || e });
    });
    this.setState({ loading: false, data: result?.report || {} });
  }
}
