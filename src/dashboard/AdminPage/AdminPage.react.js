import React            from 'react'
import { ActionTypes }  from 'lib/stores/SchemaStore';
import Parse            from 'parse';
import DashboardView    from 'dashboard/DashboardView.react';
import subscribeTo      from 'lib/subscribeTo';
import LoaderContainer  from 'components/LoaderContainer/LoaderContainer.react'
import Field            from 'components/Field/Field.react';
import Fieldset         from 'components/Fieldset/Fieldset.react';
import Label            from 'components/Label/Label.react';
import Button           from 'components/Button/Button.react';
import styles           from 'dashboard/AdminPage/AdminPage.scss'
import AdminModal       from 'dashboard/AdminPage/AdminModal'
import Toolbar          from 'components/Toolbar/Toolbar.react';
import Icon             from 'components/Icon/Icon.react';

@subscribeTo('Schema', 'schema')
class AdminPage extends DashboardView {
  constructor() {
    super()
    this.section = 'Admin Page';
    this.domain = '.admin.back4app.com'
    this.protocol = 'https://'

    this.state = {
      loading: true,
      username: '',
      password: '',
      adminHost: ''
    }

    this.legend = 'Admin App Setup'
    this.description = 'The Admin App allow users from your app to have some level of access to your app data without have access to some critical features which if wrong configured could create some instability or even break it.'
  }

  async componentDidMount() {
    const adminHost = await this.context.currentApp.getAdminHost()
    this.setState({ adminHost, loading: false })
  }

  async createRole(admin) {
    const roleACL = new Parse.ACL();
    roleACL.setPublicReadAccess(true);
    const role = new Parse.Role("AdminUser", roleACL);
    role.getUsers().add([admin])
    return await role.save();
  }

  async createUser(user) {
    const admin = new Parse.User()
    admin.set('username', user.username);
    admin.set('password', user.password);
    return await admin.signUp()
  }

  async createSetting() {
    const Setting = Parse.Object.extend('Setting');
    const newSetting = new Setting();
    newSetting.set('appName', this.props.appName);
    return await newSetting.save()
  }

  async createHost() {
    const { adminHost } = this.state
    // Create admin host
    await this.context.currentApp.addAdminHost(adminHost)
  }

  async createClasses() {
    // Create default admin classes
    await this.props.schema.dispatch(ActionTypes.CREATE_CLASS, { className: 'Setting' })
    await this.props.schema.dispatch(ActionTypes.CREATE_CLASS, { className: 'CustomField' })
    await this.props.schema.dispatch(ActionTypes.CREATE_CLASS, { className: 'MenuItem' })

    // Create setting class
    await this.createSetting()
  }

  async createAdmin() {
    const { username, password } = this.state
    const admin = await this.createUser({ username, password })

    // Create role and a relation with admin
    await this.createRole(admin)
  }

  async renderModal() {
    await AdminModal.show({
      domain: this.domain,
      setState: this.setState.bind(this),
      createAdmin: this.createAdmin.bind(this),
      createClasses: this.createClasses.bind(this),
      createAdminHost: this.createHost.bind(this),
      ...this.state
    })
  }

  renderContent() {
    const isAdminHostEnabled = this.state.adminHost || false
    const adminURL = this.protocol + this.state.adminHost

    const toolbar = (
      <Toolbar
        section='Admin Page'>
      </Toolbar>
    );

    const fields = <Fieldset legend={this.legend} description={this.description}>
      <Field
        height='120px'
        textAlign='center'
        label={<Label text='Enable Admin Page' description='Once the Admin Page were enabled some classes will be created on your App to allow it work' />}
        input={<div className={styles['input']}>
          {
            isAdminHostEnabled
              ? <Icon name='admin-app-check' width={50} height={50}
                      fill='#4CAF50' className={styles['input-child']}></Icon>
              : <Button value='Enable Admin Page'
                        onClick={this.renderModal.bind(this)}
                        primary={true}
                        className={styles['input-child']}/>
          }
        </div>
        }>
      </Field>
      {
        isAdminHostEnabled
        ? <Field
            height='120px'
            textAlign='center'
            label={<Label text='Admin Page Public URL' description='Share your Admin Page URL with users you want to have access to it. Only users associated with the role AdminUser will be able to login into the Admin Page' />}
            input={<div className={styles['input']}><a target='_blank' href={adminURL} className={styles['input-child']}>{adminURL}</a></div>}>
          </Field>
        : ''
      }
    </Fieldset>

    return (
      <LoaderContainer className={styles.loading} loading={this.state.loading} hideAnimation={false} solid={false}>
        <div className={styles['admin-page']}>
          {toolbar}
          {fields}
        </div>
      </LoaderContainer>
    )
  }
}

export default AdminPage
