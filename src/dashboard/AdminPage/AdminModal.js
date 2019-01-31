import Swal                 from 'sweetalert2'
import withReactContent     from 'sweetalert2-react-content'
import React                from 'react'
import ReactDOMServer       from 'react-dom/server';
import styles               from 'dashboard/AdminPage/AdminPage.scss'

// Modal parameters
const MySwal = withReactContent(Swal)
const modalOptions = {
  confirmButtonText: 'Next &rarr;',
  showCancelButton: true,
  progressSteps: ['1', '2', '3'],
  reverseButtons: true,
  width: '42rem',
  padding: '2.5em'
}

const renderUserInputs = () => {
  return ReactDOMServer.renderToString(<div className={styles['elements-wrapper']}>
    <input name='adminUser' id='adminUser' type='text' placeholder='username' autoComplete='off' className={[`swal2-input ${styles['inline-elements']}`].join('')} />
    <input name='adminPass' id='adminPass' type='password' placeholder='password' autoComplete='off' className={[`swal2-input ${styles['inline-elements']}`].join('')} />
  </div>)
}

const renderHostInput = (domain) => {
  return ReactDOMServer.renderToString(<div className={styles['elements-wrapper']}>
    <input name='adminHost' id='adminHost' type='text' placeholder='Admin Host' autoComplete='off' className={[`swal2-input ${styles['inline-elements']}`].join('')} />
    <span className={styles['inline-elements']}>{domain}</span>
  </div>)
}

const renderConfirmStep = () => {
  return ReactDOMServer.renderToString(<div className={`${styles['elements-wrapper']} ${styles['congrats-box']}`}>
    <p className={styles['congrats-message']}>Congratulations, your Admin Page is active!</p>
    <a target='_blank'></a>
  </div>)
}

const show = async ({domain, setState, createAdmin, createClasses, createAdminHost, activateLiveQuery}) => {
  let confirmedHost = ''
  const steps = await Swal.mixin(modalOptions).queue([
    {
      title: 'Create an Admin User',
      html: renderUserInputs(setState),
      preConfirm: async () => {
        try {
          Swal.showLoading()

          const username = document.getElementById('adminUser').value
          const password = document.getElementById('adminPass').value

          await setState({ username, password })
          await createAdmin()
          await createClasses()
        } catch(err) {
          Swal.showValidationMessage(
            `Request failed: ${err}`
          )
        }
      }
    },
    {
      title: 'Choose your Admin App subdomain',
      text: '',
      html: renderHostInput(domain, setState),
      preConfirm: async () => {
        try {
          Swal.showLoading()

          const host = document.getElementById('adminHost').value

          await setState({host: host})
          confirmedHost = await createAdminHost()
          await activateLiveQuery()
        } catch(err) {
          Swal.showValidationMessage(
            `Request failed: ${err}`
          )
        }
      }
    },
    {
      type: 'success',
      html: renderConfirmStep(),
      showCancelButton: false,
      confirmButtonText: 'Got it!',
      onBeforeOpen: () => {
        const a = Swal.getContent().querySelector('a')
        a.href = a.text = confirmedHost
      }
    }
  ])

  return steps.value && steps.value[0] && steps.value[1] && steps.value[2]
}

const AdminModal = { show }

export default AdminModal
