const ADMIN_ROLE = 'B4aAdminUser'
const MENU_ITEM_CLASS = 'B4aMenuItem'
const CUSTOM_FIELD_CLASS = 'B4aCustomField'
const SETTING_CLASS = 'B4aSetting'

const B4aAdminParams = ({ appName }) => ({
  classes: [
    {
      name: SETTING_CLASS,
      rows: [
        { key: "appName", value: appName }
      ]
    },
    {
      name: MENU_ITEM_CLASS,
      rows: [
        { title: "Menu Item", objectClassName: MENU_ITEM_CLASS, relevance: "-1000" },
        { title: "Custom Field", objectClassName: CUSTOM_FIELD_CLASS, relevance: "-2000" },
        { title: "Setting", objectClassName: SETTING_CLASS, relevance: "-3000" }
      ]
    },
    {
      name: CUSTOM_FIELD_CLASS,
      rows: [
        { objectClassName: MENU_ITEM_CLASS, objectClassFieldName: "relevance", title: "Relevance", subType: "", isRequired: false },
        { objectClassName: MENU_ITEM_CLASS, objectClassFieldName: "objectClassName", title: "Class", subType: "", isRequired: true },
        { objectClassName: MENU_ITEM_CLASS, objectClassFieldName: "title", title: "Title", subType: "", isRequired: true },
        { objectClassName: "_User", objectClassFieldName: "emailVerified", title: "Is Email Verified", subType: "", isRequired: false },
        { objectClassName: "_User", objectClassFieldName: "authData", title: "Auth Data", subType: "", isRequired: false },
        { objectClassName: "_User", objectClassFieldName: "email", title: "Email", subType: "", isRequired: false },
        { objectClassName: "_User", objectClassFieldName: "password", title: "Password", subType: "PASSWORD", isRequired: true },
        { objectClassName: "_User", objectClassFieldName: "username", title: "Username", subType: "", isRequired: true }
      ]
    }
  ],
  adminRole: ADMIN_ROLE,
  defaultCLP: {
    find: {
      [`role:${ADMIN_ROLE}`]: true
    },
    get: {},
    create: {},
    update: {},
    delete: {},
    addField: {}
  }
})

export default B4aAdminParams
