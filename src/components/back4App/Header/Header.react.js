import React from 'react';
import Media from 'react-media';
import Icon  from 'components/Icon/Icon.react';
import HamburgerButton from 'components/back4App/HamburgerButton/HamburgerButton.react';
import Logo from 'components/back4App/Logo/Logo.react';
import Nav from 'components/back4App/HeaderNav/HeaderNav.react';
import Dropdown from 'components/back4App/Dropdown/Dropdown.react';
import Button from 'components/back4App/Button/Button.react';
import subscribeTo from 'lib/subscribeTo';
import styles from 'components/back4App/Header/Header.scss';
import navData from 'components/back4App/Header/headerNavData';

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: null
    };
  } 
  componentWillMount() {
    /*
      - Thi-s resource should be implemented following parse-dashboard community standards (using flux).
      But it was actualy not possible to use the subscribeTo decorator in the Header component 
      before the App was injected in the router. This is a simple temporary solution.
    */
    fetch('https://dashboard.back4app.com/me', {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => response.json())
    .then(response => {
      this.setState({
        username: response.username.split('@')[0]
      });
    })
    .catch(error => {
      console.log("Error", error);
    });
  }
  render() {
    return (
      <header className={styles.header}>
        <div className={styles['left-side']}>
          <Media query="(max-width: 1099px)">
            <div className={styles['hamburger-wrapper']}>
              <HamburgerButton onClick={() => {
                this.props.sidebarToggle();
              }} />
            </div>
          </Media>
          <Media query="(min-width: 1100px)">
            <a className={styles['logo-face']} href="http://www.back4app.com/">
              <Icon width={46} height={47} name='back4app-logo-face-blue' fill='#208AEC' />
            </a>
          </Media>
          <a className={styles['logo-text']} href="http://www.back4app.com/">
            <Icon width={134} height={53} name='back4app-logo-text-blue' fill='#208AEC' />
          </a>
        </div>

        <div className={styles['right-side']}>

          <Media query="(min-width: 1100px)">
            <Nav items={navData.items} />
          </Media>

          <Media query="(min-width: 1100px)">
            <div className="ml-auto">
              <Dropdown items={navData.dropdownItems}>{this.state.username && `Hello, ${this.state.username}`}<i className="dropdown-icon zmdi zmdi-caret-down"></i></Dropdown>
              <Button color="green" weight="700" url="https://dashboard.back4app.com/apps/#!/apps/new">NEW APP</Button>
            </div>
          </Media>

        </div>
      </header>
    );
  }
}
