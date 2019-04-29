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
import styles           from 'dashboard/B4aAdminPage/B4aAdminPage.scss'
import B4aAdminModal    from 'dashboard/B4aAdminPage/B4aAdminModal'
import B4aAdminParams   from 'dashboard/B4aAdminPage/B4aAdminParams'
import Toolbar          from 'components/Toolbar/Toolbar.react';
import Icon             from 'components/Icon/Icon.react';
import ReactPlayer      from 'react-player';


@subscribeTo('Schema', 'schema')
class B4aAdminPage extends DashboardView {
  constructor() {
    super()
    this.section = 'Admin App';
    this.adminDomain = b4aSettings.ADMIN_DOMAIN
    this.webHostDomain = '.back4app.io'
    this.protocol = 'https://'

    this.state = {
      loading: true,
      username: '',
      password: '',
      host: '',
      adminURL: '',
      webHost: '',
      isRoleCreated: false,
      adminParams: {}
    }

    this.legend = 'Admin App Setup'
    this.description = 'Admin App is a web browser-based tool designed to manage the app data using a non-tech user interface.'
  }

  async componentDidMount() {
    const adminParams = B4aAdminParams({ appName: this.context.currentApp.name })
    await this.setState({ adminParams })

    const adminHost = await this.context.currentApp.getAdminHost()
    const webHost = await this.context.currentApp.getWebHost()
    const adminURL = adminHost ? this.protocol + adminHost : ''
    const isRoleCreated = await this.checkRole()
    this.setState({ isRoleCreated, adminHost, adminURL, webHost, loading: false })

    if (typeof back4AppNavigation !== 'undefined' && typeof back4AppNavigation.atAdminPageEvent === 'function')
      back4AppNavigation.atAdminPageEvent()
  }

  async checkRole() {
    const { adminParams } = this.state

    const queryRole = new Parse.Query(Parse.Role)
    queryRole.equalTo('name', adminParams.adminRole)
    const result = await queryRole.first({ useMasterKey: true })
    return !!result
  }

  async createRole(admin) {
    const { adminParams } = this.state

    const roleACL = new Parse.ACL()
    roleACL.setPublicReadAccess(true)
    roleACL.setPublicWriteAccess(true)
    const role = new Parse.Role(adminParams.adminRole, roleACL)
    role.getUsers().add([admin])
    return await role.save(undefined, { useMasterKey: true })
  }

  async createUser(user) {
    const admin = new Parse.User()
    admin.set('username', user.username)
    admin.set('password', user.password)
    return await admin.signUp(undefined, { useMasterKey: true })
  }

  async setClassLevelPermission() {
    const { adminParams } = this.state
    const promises = []
    for (let { name } of adminParams.classes)
      promises.push(this.props.schema.dispatch(ActionTypes.SET_CLP, {
        className: name,
        clp: adminParams.customCLP[name] || adminParams.defaultCLP
      }))
    await Promise.all(promises)
  }

  async createClasses() {
    const { adminParams } = this.state
    const promises = []
    for (let { name, rows } of adminParams.classes) {
      const ParseObject = Parse.Object.extend(name)
      for (let row of rows) {
        const newObject = new ParseObject()
        Object.entries(row).forEach(([key, value]) => {
          newObject.set(key, value)
        })
        promises.push(newObject.save(undefined, { useMasterKey: true }))
      }
    }
    // wait until each object has been saved properly
    await Promise.all(promises)
    await this.setClassLevelPermission()
  }

  async activateLiveQuery() {
    await this.props.schema.dispatch(ActionTypes.FETCH)
    const schemasChoose = {}

    this.props.schema.data.get('classes').filter((key, className) => {
      return className.indexOf('_') !== 0 || className === '_User'
    }).forEach((key, className) => schemasChoose[className] = true)

    await this.context.currentApp.setLiveQuery({ schemasChoose , statusLiveQuery: true })
  }

  async createHost() {
    const { host, webHost } = this.state

    // Activate webHost
    if (!webHost || !webHost.activated) {
      const subdomainName = webHost && webHost.subdomainName || host + this.webHostDomain
      const hostSettings = { subdomainName, activated: true }
      await this.context.currentApp.setWebHost(hostSettings)
      this.setState({ webHost: hostSettings })
    }

    // Create admin host
    await this.context.currentApp.addAdminHost(host + this.adminDomain)
    return this.protocol + host + this.adminDomain
  }

  async createAdmin() {
    const { username, password } = this.state
    const admin = await this.createUser({ username, password })

    // Create role and a relation with admin
    await this.createRole(admin)
    await this.setState({ isRoleCreated: true })
  }

  async createTextIndexes() {
    await this.context.currentApp.createTextIndexes()
  }

  async renderModal() {
    await B4aAdminModal.show({
      domain: this.adminDomain,
      setState: this.setState.bind(this),
      createAdmin: this.createAdmin.bind(this),
      createClasses: this.createClasses.bind(this),
      createAdminHost: this.createHost.bind(this),
      activateLiveQuery: this.activateLiveQuery.bind(this),
      createTextIndexes: this.createTextIndexes.bind(this),
      ...this.state
    })

    if (typeof back4AppNavigation !== 'undefined' && typeof back4AppNavigation.onShowAdminModalEvent === 'function')
      back4AppNavigation.onShowAdminModalEvent()
  }

  renderContent() {
    const isAdminHostEnabled = this.state.adminURL || false
    const adminURL = this.state.adminURL

    const toolbar = (
      <Toolbar
        section='Admin App'>
      </Toolbar>
    );

    const fields = <Fieldset legend={this.legend} description={this.description}>
      <ReactPlayer
        url='https://www.youtube.com/watch?v=7CHdIniAACE'
        controls
        width="650px"
        style={{
          border: "1px solid #000",
          borderRadius: "4px",
          marginBottom: "20"
        }} />
      <Field
        height='120px'
        textAlign='center'
        label={<Label text='Is Enabled?' description="Enabling will automatically add three new classes, new indexes and a new role to your application’s schema." />}
        input={<div className={styles['input']}>
          {
            isAdminHostEnabled
              ? <Icon name='admin-app-check' width={50} height={50}
                      fill='#4CAF50' className={styles['input-child']}></Icon>
              : <Button value='Enable Admin App'
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
            label={<Label text='Admin App URL' description='Use this address to share your Admin App with trusted users. Only users with the B4aAdminUser role will be allowed to log in.' />}
            input={<div className={styles['input']}><a target='_blank' href={adminURL} className={styles['input-child']}>{adminURL}</a></div>}>
          </Field>
        : ''
      }
    </Fieldset>

    return (
      <LoaderContainer className={styles.loading} loading={this.state.loading} hideAnimation={false} solid={true}>
        <div className={styles['admin-page']}>
          {toolbar}
          {fields}
        </div>
      </LoaderContainer>
    )
  }
}

export default B4aAdminPage
