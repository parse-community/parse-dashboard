import ParseApp from 'lib/ParseApp';
import React    from 'react';

export default class SettingsData extends React.Component {
  constructor() {
    super();

    this.state = {
      fields: undefined
    };
  }

  componentDidMount() {
    this.context.currentApp.fetchSettingsFields().then(({ fields }) => {
      this.setState({ fields });
    });
  }

  componentWillReceiveProps(props, context) {
    if (this.context !== context) {
      this.setState({ fields: undefined });
      context.currentApp.fetchSettingsFields().then(({ fields }) => {
        this.setState({ fields });
      });
    }
  }

  saveChanges(changes) {
    let promise = this.context.currentApp.saveSettingsFields(changes)
    promise.then(({successes, failures}) => {
      let newFields = {...this.state.fields, ...successes};
      this.setState({fields: newFields});
    });
    return promise;
  }

  render() {
    let child = React.Children.only(this.props.children);
    return React.cloneElement(
      child,
      {
        ...child.props,
        initialFields: this.state.fields,
        saveChanges: this.saveChanges.bind(this)
      }
    );
  }
}

SettingsData.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
