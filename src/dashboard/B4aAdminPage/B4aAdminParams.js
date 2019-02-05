const B4aAdminParams = ({ appName }) => ({
  classes: [
    {
      name: "B4aSetting",
      rows: [
        { key: "appName", value: appName }
      ]
    },
    {
      name: "B4aMenuItem",
      rows: [
        { title: "Menu Item", objectClassName: "B4aMenuItem", relevance: "-1000" },
        { title: "Custom Field", objectClassName: "B4aCustomField", relevance: "-2000" },
        { title: "Setting", objectClassName: "B4aSetting", relevance: "-3000" }
      ]
    },
    {
      name: "B4aCustomField",
      rows: [
        { objectClassName: "B4aMenuItem", objectClassFieldName: "relevance", title: "Relevance", subType: "", isRequired: false },
        { objectClassName: "B4aMenuItem", objectClassFieldName: "objectClassName", title: "Class", subType: "", isRequired: true },
        { objectClassName: "B4aMenuItem", objectClassFieldName: "title", title: "Title", subType: "", isRequired: true },
        { objectClassName: "_User", objectClassFieldName: "emailVerified", title: "Is Email Verified", subType: "", isRequired: false },
        { objectClassName: "_User", objectClassFieldName: "authData", title: "Auth Data", subType: "", isRequired: false },
        { objectClassName: "_User", objectClassFieldName: "email", title: "Email", subType: "", isRequired: false },
        { objectClassName: "_User", objectClassFieldName: "password", title: "Password", subType: "PASSWORD", isRequired: true },
        { objectClassName: "_User", objectClassFieldName: "username", title: "Username", subType: "", isRequired: true }
      ]
    }
  ],
  adminRole: "B4aAdminUser"
})

export default B4aAdminParams
