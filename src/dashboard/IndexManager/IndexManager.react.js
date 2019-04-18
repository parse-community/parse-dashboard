import { ActionTypes }  from 'lib/stores/SchemaStore'
import CategoryList from 'components/CategoryList/CategoryList.react'
import DashboardView from 'dashboard/DashboardView.react'
import EmptyState from 'components/EmptyState/EmptyState.react'
import history from 'dashboard/history'
import Icon from 'components/Icon/Icon.react';
import IndexForm from './IndexForm.react'
import ParseApp from 'lib/ParseApp'
import React from 'react'
import { SpecialClasses } from 'lib/Constants'
import stringCompare from 'lib/stringCompare'
import styles from './IndexManager.scss'
import subscribeTo from 'lib/subscribeTo'
import Swal from 'sweetalert2'

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
    const { className: newClassName } = props.params
    if (newClassName !== className) {
      this.setState({
        loading: true
      });
      context.currentApp.getIndexes(newClassName).then(data => {
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
    const { index, indexOptions } = indexConfiguration
    const indexName = indexOptions.name || Object.entries(index).map(entry => entry.join('_')).join('_')
    const indexTypes = Object.values(index)

    const errorMessages = []

    if (!indexName || indexName.trim().length === 0) {
      errorMessages.push('Index name is required')
    }

    const { className } = this.props.params
    const schema = this.props.schema.data.get('classes').get(className).toJSON()

    if (Object.keys(index).filter(indexedField => schema[indexedField].type === 'Array').length > 1) {
      errorMessages.push('Indexes can only have one Array field')
    }
    if (indexTypes.some((indexType, i) => i > 0 && (indexType === '2d' || indexType === '2dsphere' || indexType === 'geoHaystack'))) {
      errorMessages.push('The first index field must be the geolocation field')
    }

    let isIndexNameValid = true, isIndexFieldsValid = true, isTextIndexValid = true
    const containsTextIndex = indexTypes.indexOf('text') !== -1
    this.state.data.forEach(({ name, index: existingIndex }) => {
      if (name === indexName) {
        isIndexNameValid = false
      }
      if (JSON.stringify(Object.keys(JSON.parse(existingIndex))) === JSON.stringify(Object.keys(index))) {
        isIndexFieldsValid = false
      }
      if (Object.values(JSON.parse(existingIndex)).indexOf('text') !== -1 && containsTextIndex) {
        isTextIndexValid = false
      }
    })
    if (!isIndexNameValid) {
      errorMessages.push('Index name must be unique')
    }
    if (!isIndexFieldsValid) {
      errorMessages.push('Index fields order must be unique')
    }
    if (!isTextIndexValid) {
      errorMessages.push('Only one text index is allowed per class')
    }
    if (errorMessages.length) {
      Swal.fire({
        title: 'We found some errors',
        html: `<p style="text-align: center">${errorMessages.join('</p><p style="text-align: center">')}</p>`,
        type: 'error',
        confirmButtonText: 'OK'
      })
    } else {
      const { className } = this.props.params
      this.context.currentApp.createIndex(className, indexConfiguration)
      this.closeIndexForm()
    }
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
      delete schema.ACL
      const classes = {
        [className]: Object.keys(schema)
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
        {this.state.loading || this.state.data.length === 0
          ? <EmptyState icon='index-manager' title='No indexes were found' description='Create an index using the button located on the top right side' />
          : (
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
          )
        }
        {this.renderIndexForm()}
      </div>
    )
  }
}

IndexManager.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
}

export default IndexManager
