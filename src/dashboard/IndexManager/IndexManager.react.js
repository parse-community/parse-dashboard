import { ActionTypes }  from 'lib/stores/SchemaStore'
import CategoryList from 'components/CategoryList/CategoryList.react'
import DashboardView from 'dashboard/DashboardView.react'
import history from 'dashboard/history'
import Icon from 'components/Icon/Icon.react';
import IndexForm from './IndexForm.react'
import ParseApp from 'lib/ParseApp'
import React from 'react'
import { SpecialClasses } from 'lib/Constants'
import stringCompare from 'lib/stringCompare'
import styles from './IndexManager.scss'
import subscribeTo from 'lib/subscribeTo'

@subscribeTo('Schema', 'schema')
class IndexManager extends DashboardView {
  constructor(props, context) {
    super(props, context);

    this.section = 'Core';
    this.subsection = 'Index Manager'

    this.state = {
      loading: true,
      selected: {},
      data: null,
      showIndexManager: false
    }

    this.refresh = this.refresh.bind(this)
    this.toggleRow = this.toggleRow.bind(this)
    this.showIndexForm = this.showIndexForm.bind(this)
    this.closeIndexForm = this.closeIndexForm.bind(this)
    this.createIndexes = this.createIndexes.bind(this)
    this.dropIndexes = this.dropIndexes.bind(this)
  }

  componentWillMount() {
    const { className } = this.props.params
    this.props.schema.dispatch(ActionTypes.FETCH).then(() => {
      if (!className && this.props.schema.data.get('classes')) {
        this.redirectToFirstClass(this.props.schema.data.get('classes'));
      }
    })
    if (className) {
      this.context.currentApp.getIndexes(className).then(data => {
        this.setState({
          data,
          loading: false
        })
      })
    }
  }

  redirectToFirstClass(classList) {
    if (!classList.isEmpty()) {
      classList = Object.keys(classList.toObject())
      let classes = classList.filter(className => className !== '_Role' && className !== '_Session' && className !== '_Installation')
      classes.sort((a, b) => {
        if (a[0] === '_' && b[0] !== '_') {
          return -1
        }
        if (b[0] === '_' && a[0] !== '_') {
          return 1
        }
        return a.toUpperCase() < b.toUpperCase() ? -1 : 1
      })
      if (classes[0]) {
        history.replace(this.context.generatePath(`index/${classes[0]}`))
      } else {
        if (classList.indexOf('_User') !== -1) {
          history.replace(this.context.generatePath('index/_User'))
        } else {
          history.replace(this.context.generatePath(`index/${classList[0]}`))
        }
      }
    }
  }

  componentWillReceiveProps(props, context) {
    const { className } = this.props.params
    if (props.className !== className) {
      this.setState({
        loading: true
      });
      context.currentApp.getIndexes(className).then(data => {
        this.setState({
          data,
          loading: false
        })
      })
    }
  }

  refresh() {
    const { className } = this.props.params
    this.setState({
      loading: true,
      selected: {},
      data: null,
      showIndexManager: false
    })
    this.context.currentApp.getIndexes(className).then(data => {
      this.setState({
        data,
        loading: false
      })
    })
  }

  toggleRow(name) {
    this.setState({
      selected: {
        ...this.state.selected,
        [name]: !this.state.selected[name]
      }
    })
  }

  showIndexForm() {
    this.setState({ showIndexForm: true })
  }

  closeIndexForm() {
    this.setState({ showIndexForm: false })
  }

  createIndexes(indexConfiguration) {
    const { className } = this.props.params
    this.context.currentApp.createIndex(className, indexConfiguration)
    this.closeIndexForm()
  }

  dropIndexes() {
    const { className } = this.props.params
    const indexesToDrop = Object.entries(this.state.selected).filter(([, isSelected]) => isSelected).map(([indexName]) => indexName)
    this.context.currentApp.dropIndexes(className, indexesToDrop).then(this.refresh)
  }

  renderIndexForm() {
    if (this.state.showIndexForm) {
      const { className } = this.props.params
      const schema = this.props.schema.data.get('classes').get(className).toJSON()
      const classes = {
        [className]: Object.keys(schema).filter(column => column !== 'ACL')
      }
      return <IndexForm classes={classes} onConfirm={this.createIndexes} onCancel={this.closeIndexForm} />
    }
    return null
  }

  renderRows() {
    return this.state.data.map(({ name, index, creationType, status, unique = false, sparse = false }) => {
      return (
        <tr key={name}>
          <td className={styles.selectedContainer}>
            <input type='checkbox' value={!!this.state.selected[name]} onChange={() => this.toggleRow(name)} />
          </td>
          <td>{name}</td>
          <td>{creationType}</td>
          <td className={[styles.indexStatus, styles[`indexStatus-${status.toLowerCase()}`]].join(' ')}>
            <span className={styles.statusIcon}>●</span>
            {status}
          </td>
          <td>{index}</td>
          <td>{unique ? 'True' : 'False'}</td>
          <td>{sparse ? 'True' : 'False'}</td>
        </tr>
      )
    })
  }

  renderSidebar() {
    const className = this.props.params.className || ''
    const classes = this.props.schema.data.get('classes')
    if (!classes) {
      return null
    }
    const special = []
    const categories = []
    classes.forEach((value, key) => {
      if (SpecialClasses[key]) {
        special.push({ name: SpecialClasses[key], id: key })
      } else {
        categories.push({ name: key })
      }
    });
    special.sort((a, b) => stringCompare(a.name, b.name))
    categories.sort((a, b) => stringCompare(a.name, b.name))

    return <CategoryList current={className} linkPrefix='index/' categories={special.concat(categories)} />
  }

  renderContent() {
    console.log(this.props)
    if (this.state.loading) {
      // TODO: Use EmptyState
      return <div>Loading indexes...</div>
    }

    const { className } = this.props.params
    return (
      <div className={styles.indexManager}>
        <div className={styles.headerContainer}>
          <section className={styles.header}>
            <span className={styles.subtitle}>Index Manager</span>
            <div>
              <span className={styles.title}>{className} Indexes</span>
            </div>
          </section>

          <section className={styles.toolbar}>
            <a className={styles.toolbarButton} onClick={this.showIndexForm} title='Add an index'>
              <Icon name='add-row' width={32} height={26} />
            </a>
            <a className={styles.toolbarButton} onClick={this.refresh} title='Refresh'>
              <Icon name='refresh' width={30} height={26} />
            </a>
            <a className={styles.toolbarButton} onClick={this.dropIndexes} title='Drop index'>
              <Icon name='trash-solid' width={30} height={26} />
            </a>
          </section>
        </div>
        <table className={styles.indexTable}>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Creation Type</th>
              <th>Status</th>
              <th>Fields</th>
              <th>Unique</th>
              <th>Sparse</th>
            </tr>
          </thead>
          <tbody>
            {this.renderRows()}
          </tbody>
        </table>
        {this.renderIndexForm()}
      </div>
    )
  }
}

IndexManager.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
}

export default IndexManager
