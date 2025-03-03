import Button from 'components/Button/Button.react';
import React from 'react';
import styles from './BrowserFooter.scss';

class BrowserFooter extends React.Component {
  state = {
    pageInput: (Math.floor(this.props.skip / this.props.limit) + 1).toString(),
  };

  handleLimitChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    this.props.setLimit(newLimit);
    this.props.setSkip(0);
    this.setState({ pageInput: '1' });
  };

  handlePageChange = (newSkip) => {
    if (newSkip >= 0 && newSkip < this.props.count) {
      this.props.setSkip(newSkip);
      this.setState({ pageInput: (Math.floor(newSkip / this.props.limit) + 1).toString() });
    }
  };

  handleInputChange = (e) => {
    const value = e.target.value;

    // Allow user to type freely but validate only on blur/Enter
    if (value === '' || /^\d*$/.test(value)) {
      this.setState({ pageInput: value });
    }
  };

  validateAndApplyPage = () => {
    const { limit, count } = this.props;
    let newPage = parseInt(this.state.pageInput, 10);

    if (isNaN(newPage) || newPage < 1) {
      newPage = 1;
    } else if (newPage > Math.ceil(count / limit)) {
      newPage = Math.ceil(count / limit);
    }

    this.setState({ pageInput: newPage.toString() });
    this.handlePageChange((newPage - 1) * limit);
  };

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.validateAndApplyPage();
    }
  };

  render() {
    const { skip, count, limit } = this.props;
    const totalPages = Math.ceil(count / limit);

    return (
      <div className={styles.footer}>
        <span>
          <strong>{count?.toLocaleString() || 0}</strong> objects
        </span>
        <select value={limit} onChange={this.handleLimitChange}>
          {[10, 20, 50, 100, 200, 500, 1000].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>per page</span>
        <input
          type="text"
          style={{ marginLeft: 'auto', width: '50px' }}
          value={this.state.pageInput}
          onChange={this.handleInputChange}
          onBlur={this.validateAndApplyPage}
          onKeyDown={this.handleKeyDown}
        />
        <span>/ {totalPages.toLocaleString()}</span>
        <Button
          value="Previous"
          width="100px"
          onClick={() => this.handlePageChange(skip - limit)}
          disabled={skip === 0}
        />
        <Button
          value="Next"
          width="100px"
          onClick={() => this.handlePageChange(skip + limit)}
          disabled={skip + limit >= count}
        />
      </div>
    );
  }
}

export default BrowserFooter;
