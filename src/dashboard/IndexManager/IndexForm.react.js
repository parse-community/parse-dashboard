import React, { Component } from 'react'
import Dropdown from 'components/Dropdown/Dropdown.react';
import Field from 'components/Field/Field.react';
import Icon from 'components/Icon/Icon.react'
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react'
import Option from 'components/Dropdown/Option.react';
import PropTypes from 'lib/PropTypes'
import TextInput from 'components/TextInput/TextInput.react';
import Toggle from 'components/Toggle/Toggle.react';
import styles from 'dashboard/IndexManager/IndexForm.scss';
import Swal from 'sweetalert2';

class IndexForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedClass: undefined,
      indexFields: {},
      indexName: '',
      unique: false,
      sparse: false,
      // expireAfterSeconds: '',
      weights: {}
    }
    this.onChangeIndexName = this.onChangeIndexName.bind(this)
    this.createIndex = this.createIndex.bind(this)
    // this.onChangeTTL = this.onChangeTTL.bind(this)
    this.onBlurIndexWeight = this.onBlurIndexWeight.bind(this)
  }

  componentDidMount() {
    const classes = Object.keys(this.props.classes)
    if (classes.length === 1) {
      this.setState({ selectedClass: classes[0] })
    }
  }

  addIndex(field) {
    this.setState({
      indexFields: {
        ...this.state.indexFields,
        [field]: '1'
      }
    })
  }

  removeIndex(field) {
    const newState = { ...this.state.indexFields }
    delete newState[field]
    this.setState({ indexFields: newState })
  }

  updateIndexField(field, newField) {
    const newState = { ...this.state.indexFields }
    delete newState[field]
    newState[newField] = '1'
    this.setState({ indexFields: newState })
  }

  updateIndexType(field, type) {
    const newState = { ...this.state.indexFields }
    newState[field] = type

    const newWeights = { ...this.state.weights }
    // Update the weight, if the type is text
    if (type === 'text') {
      newWeights[field] = '1'
    }
    // Otherwise, delete this weight
    else if (newWeights[field]) {
      delete newWeights[field]
    }
    this.setState({
      indexFields: newState,
      weights: newWeights
    })
  }

  updateIndexWeight(field, weight) {
    if (weight === '') {
      const newWeights = {
        ...this.state.weights
      }
      delete newWeights[field]
      this.setState({
        weights: newWeights
      })
      return
    }
    const intWeight = Math.abs(parseInt(weight))
    if (intWeight > Number.MAX_SAFE_INTEGER) {
      return
    }
    if (!isNaN(intWeight)) {
      this.setState({
        weights: {
          ...this.state.weights,
          [field]: intWeight.toString()
        }
      })
    }
  }

  onBlurIndexWeight(field, weight) {
    if (!weight) {
      // If, on blur, the weight was left with an invalid value
      // sets 1, which is the default value
      this.setState({
        weights: {
          ...this.state.weights,
          [field]: 1
        }
      })
    }
  }

  // onChangeTTL(value) {
  //   if (value === '') {
  //     this.setState({
  //       expireAfterSeconds: ''
  //     })
  //     return
  //   }
  //   const ttl = Math.abs(parseInt(value))
  //   if (ttl > Number.MAX_SAFE_INTEGER) {
  //     return
  //   }
  //   if (!isNaN(ttl)) {
  //     this.setState({
  //       expireAfterSeconds: ttl.toString()
  //     })
  //   }
  // }

  onChangeIndexName(value = '') {
    this.setState({
      indexName: value.length > 128 ? value.substr(0, 128) : value
    })
  }

  createIndex() {
    const { indexFields, indexName: name, sparse, unique, weights = {} } = this.state

    const index = {}
    // If the index is ascending (1) or descending (-1), we need to convert it to number
    for (let [key, value] of Object.entries(indexFields)) {
      // objectId does not exists on the database, only _id does
      if (key === 'objectId') {
        key = '_id'
      }
      if (value === '-1') {
        index[key] = -1
      } else if (value === '1') {
        index[key] = 1
      } else {
        index[key] = value
      }
    }
    const indexOptions = {
      name,
      sparse,
      unique,
      // expireAfterSeconds,
      weights: Object.entries(weights).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = parseInt(value)
        } else {
          acc[key] = value
        }
        return acc
      }, {})
    }
    const indexConfiguration = {
      index,
      indexOptions
    }

    Swal.queue([{
      title: 'Are you sure you want to create the indexes?',
      text: 'This process will run in background and could take minutes, depending on your class size.',
      type: 'warning',
      confirmButtonText: 'Confirm',
      preConfirm: () => {
        this.props.onConfirm(indexConfiguration)
      },
      showCancelButton: true
    }])
  }

  renderClassContent() {
    const { selectedClass, indexFields } = this.state
    if (!selectedClass) return null

    const fields = selectedClass ? this.props.classes[selectedClass] : []
    const nonIndexedFields = fields.filter(field => {
      return !indexFields[field]
    })

    const options = {
      Ascending: '1',
      Descending: '-1',
      Hashed: 'hashed',
      '2D Sphere': '2dsphere',
      '2D': '2d',
      'Geo Haystack': 'geoHaystack',
      'Text': 'text'
    }

    const rows = Object.entries(indexFields).map(([name, type]) =>
      <tr key={name}>
        <td>
          <Dropdown value={name} onChange={value => this.updateIndexField(name, value)}>
            {[name, ...nonIndexedFields].map(field =>
              <Option key={field} value={field}>
                {field}
              </Option>
            )}
          </Dropdown>
        </td>
        <td>
          <Dropdown placeholder='Choose a field' value={type} onChange={value => this.updateIndexType(name, value)}>
            {Object.entries(options).map(([ label, value ]) =>
              <Option key={value} value={value}>
                {label}
              </Option>
            )}
          </Dropdown>
        </td>
        {type === 'text'
          ? (
            <td>
              <TextInput value={this.state.weights[name]} onChange={weight => this.updateIndexWeight(name, weight)} onBlur={e => this.onBlurIndexWeight(name, e.target.value)} />
            </td>
          )
          : <td className={styles.disabled}>-</td>
        }
        <td>
          <Icon className={styles.deleteIndexBtn} name='trash-solid' width={18} height={28} fill='red' onClick={() => this.removeIndex(name)} />
        </td>
      </tr>
    )
    if (nonIndexedFields.length > 0) {
      rows.push(
        <tr key='new-index'>
          <td>
            <Dropdown placeHolder='Choose a field' value={this.state.selectedClass} onChange={value => this.addIndex(value)}>
              {['', ...nonIndexedFields].map(field =>
                <Option key={field} value={field}>{field}</Option>
              )}
            </Dropdown>
          </td>
          <td className={styles.disabled}>-</td>
          <td className={styles.disabled}>-</td>
        </tr>
      )
    }

    const fieldsInput = (
      <table className={styles.indexFormTable}>
        <thead>
          <tr>
            <th>Field</th>
            <th>
              <div className={styles.indexFormHeaderContainer}>
                <span>Index Type</span>
                <Icon className={styles.helpButton} name='info-outline' width={16} height={16} fill='#169CEE' onClick={() => window.open('https://docs.mongodb.com/manual/indexes/#index-types', '_blank')} />
              </div>
            </th>
            <th>Weight</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
    return (
      <div>
        <Field
          labelWidth={35}
          label={<Label text='Fields' description='Choose the fields and the rule to fetch within it' />}
          input={fieldsInput} />
        <Field
          labelWidth={35}
          label={<Label text='Name' description='Give an easy name to identify your index' />}
          input={<TextInput placeholder='Input the index name' value={this.state.indexName} onChange={this.onChangeIndexName} />} />
      </div>
    )
  }

  render() {
    const classes = Object.keys(this.props.classes)
    const classDropdown = classes.length === 1
      ? <TextInput value={classes[0]} disabled={true} onChange={() => {}} />
      : (
        <Dropdown value={this.state.selectedClass} onChange={c => this.setState({ selectedClass: c })}>
          {Object.keys(this.props.classes).map(c => <Option key={c} value={c}>{c}</Option>)}
        </Dropdown>
      )

    return (
      <Modal width={700} type={Modal.Types.INFO} title='New Index' subtitle='Optimize your queries performance' confirmText='Create Index' onConfirm={this.createIndex} onCancel={this.props.onCancel}>
        <div className={styles.indexFormContainer}>
          <Field
            labelWidth={35}
            label={<Label text='Class' description='The Class you want to get indexed' />}
            input={classDropdown} />
          {this.renderClassContent()}
          <Field
            labelWidth={35}
            textAlign='center'
            label={<Label text='Unique' description='' help={<Icon className={styles.helpButton} name='info-outline' width={16} height={16} fill='#169CEE' onClick={() => window.open('https://docs.mongodb.com/manual/core/index-unique/', '_blank')} />} />}
            input={<Toggle type={Toggle.Types.TRUE_FALSE} value={this.state.unique} onChange={unique => this.setState({ unique })} />} />
          <Field
            labelWidth={35}
            textAlign='center'
            label={<Label text='Sparse' description='' help={<Icon className={styles.helpButton} name='info-outline' width={16} height={16} fill='#169CEE' onClick={() => window.open('https://docs.mongodb.com/manual/core/index-sparse/', '_blank')} />} />}
            input={<Toggle type={Toggle.Types.TRUE_FALSE} value={this.state.sparse} onChange={sparse => this.setState({ sparse })} />} />
          {/* <Field
            labelWidth={35}
            label={<Label text='TTL' description='' help={<Icon className={styles.helpButton} name='info-outline' width={16} height={16} fill='#169CEE' onClick={() => window.open('https://docs.mongodb.com/manual/core/index-ttl/', '_blank')} />} />}
            input={
              <TextInput
                placeholder='Input the index time to live (in seconds)'
                value={this.state.expireAfterSeconds}
                onChange={expireAfterSeconds => this.onChangeTTL(expireAfterSeconds)} />
            } /> */}
        </div>
      </Modal>
    )
  }
}

IndexForm.PropTypes = {
  classes: PropTypes.object.describe('The map of class name as key and the array of fields as value').isRequired,
  onConfirm: PropTypes.func.describe('The function invoked when the user confirms the index creation'),
  onCancel: PropTypes.func.describe('The function invoked when the user cancels the index creation')
}

export default IndexForm
