import React from "react";
import ParseApp from "lib/ParseApp";
import PropTypes from "prop-types";
import Modal from "components/Modal/Modal.react";
import Button from "components/Button/Button.react";
import LoginRow from "components/LoginRow/LoginRow.react";

export default class LoginDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      username: "",
      password: "",
    };

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.login = this.login.bind(this);
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  login() {
    const { username, password } = this.state;
    this.props.login(username, password);
    this.handleClose();
  }

  render() {
    const { currentUser, logout } = this.props;
    const { open, username, password } = this.state;

    return (
      open && (
        <Modal
          type={Modal.Types.INFO}
          title="Test ACL"
          subtitle={
            <div style={{ paddingTop: "5px" }}>
              {currentUser && (
                <p>
                  Logged in as <strong>{currentUser.get("username")}</strong>{" "}
                  <Button value={"Logout"} color="white" onClick={logout} />
                </p>
              )}
            </div>
          }
          onCancel={this.handleClose}
          onConfirm={this.login}
          confirmText="Login"
          cancelText="Cancel"
        >
          <LoginRow 
            label="Username"
            input={<input onChange={e => this.setState({username: e.nativeEvent.target.value})} />}
          />
          <LoginRow
            label="Password"
            input={<input onChange={e => this.setState({password: e.nativeEvent.target.value})} type="password" />}
          />
        </Modal>
      )
    );
  }
}

LoginDialog.contextTypes = {
  currentApp: PropTypes.instanceOf(ParseApp)
};
