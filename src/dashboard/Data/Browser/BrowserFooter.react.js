import React from 'react';
import styles from './BrowserFooter.scss';
import FooterStats from './FooterStats.react';

class BrowserFooter extends React.Component {
  state = {
    pageInput: (Math.floor(this.props.skip / this.props.limit) + 1).toString(),
  };

  componentDidUpdate(prevProps) {
    if (prevProps.count && this.props.count === 0 && prevProps.count !== 0) {
      this.props.setSkip(0);
      this.setState({ pageInput: '1' });
    }

    if (prevProps.skip !== this.props.skip) {
      this.setState({ pageInput: (Math.floor(this.props.skip / this.props.limit) + 1).toString() });
    }
  }

  handleLimitChange = event => {
    if (this.props.hasSelectedRows && !window.confirm(this.props.selectedRowsMessage)) {
      return;
    }
    const newLimit = parseInt(event.target.value, 10);
    this.props.setLimit(newLimit);
    this.props.setSkip(0);
    this.setState({ pageInput: '1' });
  };

  handlePageChange = newSkip => {
    if (newSkip >= 0 && newSkip < this.props.count) {
      if (this.props.hasSelectedRows && !window.confirm(this.props.selectedRowsMessage)) {
        return;
      }
      this.props.setSkip(newSkip);
      this.setState({ pageInput: (Math.floor(newSkip / this.props.limit) + 1).toString() });
    }

    const table = document.getElementById('browser-table');
    table.scrollTo({ top: 0 });
  };

  handleInputChange = e => {
    this.setState({ pageInput: e.target.value });
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

  handleKeyDown = e => {
    if (e.key === 'Enter') {
      this.validateAndApplyPage();
    }
  };

  render() {
    const { skip, count, limit, selectedCellsCount, selectedData } = this.props;
    const totalPages = Math.ceil(count / limit);
    const currentPage = Math.floor(skip / limit) + 1;

    return (
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span><strong>{count?.toLocaleString() || 0}</strong> objects</span>
          <span className={styles.sep} />
          <select className={styles.pageSelect} value={limit} onChange={this.handleLimitChange}>
            {[10, 20, 50, 100, 200, 500, 1000].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>per page</span>
          <span className={styles.sep} />
          <span>Objects {(skip + 1).toLocaleString()} to {Math.min(count ?? limit, skip + limit).toLocaleString()}</span>
          {selectedCellsCount > 0 && (
            <>
              <span className={styles.sep} />
              <span><strong>{selectedCellsCount.toLocaleString()}</strong> cells selected</span>
            </>
          )}
          {selectedData?.length > 0 && (
            <>
              <span className={styles.sep} />
              <FooterStats data={selectedData} />
            </>
          )}
        </div>
        <div className={styles.footerRight}>
          <span className={styles.pageLabel}>Page</span>
          <input
            className={styles.pageInput}
            type="text"
            style={{ width: `${Math.max(this.state.pageInput.length + 1, 3)}ch` }}
            value={this.state.pageInput}
            onChange={this.handleInputChange}
            onBlur={this.validateAndApplyPage}
            onKeyDown={this.handleKeyDown}
          />
          <span className={styles.pageLabel}>of {totalPages.toLocaleString()}</span>
          <button
            className={styles.navBtn}
            onClick={() => this.handlePageChange(skip - limit)}
            disabled={skip === 0}
            title="Previous page"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className={styles.navBtn}
            onClick={() => this.handlePageChange(skip + limit)}
            disabled={skip + limit >= count}
            title="Next page"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </div>
      </div>
    );
  }
}

export default BrowserFooter;
