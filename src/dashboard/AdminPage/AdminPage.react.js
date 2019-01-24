import React            from 'react'
import { ActionTypes }  from 'lib/stores/SchemaStore';
import Parse            from 'parse';
import DashboardView    from 'dashboard/DashboardView.react';
import subscribeTo      from 'lib/subscribeTo';

@subscribeTo('Schema', 'schema')
class AdminPage extends DashboardView {
  constructor() {
    super()
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

  async onCreateAdmin({ username, password, adminHost }) {
    try {
      const admin = await this.createUser({ username, password })

      // Create default admin classes
      await this.props.schema.dispatch(ActionTypes.CREATE_CLASS, { className: 'Setting' })
      await this.props.schema.dispatch(ActionTypes.CREATE_CLASS, { className: 'CustomField' })
      await this.props.schema.dispatch(ActionTypes.CREATE_CLASS, { className: 'MenuItem' })

      // Create setting class
      await this.createSetting()
      // Create role and create a relation with admin
      await this.createRole(admin)
      // Create admin host
      await this.context.currentApp.addAdminHost(adminHost)
    } catch(err) {
      console.error(err)
    }
  }

  render() {
    return <button onClick={() => this.onCreateAdmin({ username: 'lucas', password: 'asdf123', adminHost: 'lucas.admin.back4app.com' })}>Create</button>
  }
}

export default AdminPage
