import { getToken }   from 'lib/CSRFManager';
import AppsManager    from 'lib/AppsManager';
import AppsSelector   from 'components/Sidebar/AppsSelector.react';
import FeedbackDialog from 'components/FeedbackDialog/FeedbackDialog.react';
import FooterMenu     from 'components/Sidebar/FooterMenu.react';
import getSiteDomain  from 'lib/getSiteDomain';
import React          from 'react';
import SidebarHeader  from 'components/Sidebar/SidebarHeader.react';
import SidebarSection from 'components/Sidebar/SidebarSection.react';
import SidebarSubItem from 'components/Sidebar/SidebarSubItem.react';
import styles         from 'components/Sidebar/Sidebar.scss';

export default class Sidebar extends React.Component {
  constructor() {
    super();
    this.state = {
      showFeedbackDialog: false,
    };
  }

  _subMenu(subsections) {
    if (!subsections) {
      return null;
    }
    return (
      <div className={styles.submenu}>
        {subsections.map((section) => {
          let active = this.props.subsection === section.name;
          return (
            <SidebarSubItem
              key={section.name}
              name={section.name}
              link={this.props.prefix + section.link}
              action={this.props.action || null}
              actionHandler={active ? this.props.actionHandler : null}
              active={active}>
              {active ? this.props.children : null}
            </SidebarSubItem>
          );
        })}
      </div>
    );
  }

  render() {
    let apps = [].concat(AppsManager.apps()).sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)));

    let feedback = this.state.showFeedbackDialog ? 
      (
        <FeedbackDialog
          onClose={() => {
            this.setState({
              showFeedbackDialog: false
            });
          }}
          open={this.state.showFeedbackDialog} />
      ) : null;

    return (
      <div className={styles.sidebar}>
        <SidebarHeader />
        {this.props.appSelector ? <AppsSelector apps={apps} /> : null}

        <div className={styles.content}>
          {this.props.sections.map((section) => {
            let active = section.name === this.props.section;
            return (
              <SidebarSection
                key={section.name}
                name={section.name}
                icon={section.icon}
                style={section.style}
                link={this.props.prefix + section.link}
                active={active}>
                {active ? this._subMenu(section.subsections) : null}
              </SidebarSection>
            );
          })}
        </div>
        <div className={styles.footer}>
          <form ref='switch' method='post' action={`${getSiteDomain()}/account/swap_dashboard`}>
            <input type='hidden' name='authenticity_token' value={getToken()} />
          </form>
          <a
            href="javascript:;"
            role="button"
            onClick={() => this.refs.switch.submit()}>
              Leave beta dashboard
          </a>
          <a
            href="javascript:;"
            role="button"
            onClick={() => {
              this.setState({
                showFeedbackDialog: true
              });
            }} >
              Feedback
          </a>
          <FooterMenu />
        </div>
        {feedback}
      </div>
    );
  }
}

Sidebar.contextTypes = {
  generatePath: React.PropTypes.func
};
