import Swal                 from 'sweetalert2'
import withReactContent     from 'sweetalert2-react-content'
import React                from 'react'
import styles               from 'dashboard/B4aAdminPage/B4aAdminPage.scss'

// Modal parameters
const modalOptions = {
  confirmButtonText: 'Next &rarr;',
  showCancelButton: true,
  progressSteps: ['1', '2', '3'],
  reverseButtons: true,
  width: '42rem',
  padding: '2.5em'
}

const onKeyUp = (event) => {
  if (event.key === 'Enter') {
    Swal.clickConfirm();
  }
}

const renderUserInputs = () => {
  return <div className={styles['elements-wrapper']}>
    <input name='adminUser' id='adminUser' type='text' placeholder='username' autoComplete='off' className={[`swal2-input ${styles['inline-elements']}`].join('')} />
    <input name='adminPass' id='adminPass' type='password' placeholder='password' autoComplete='off' className={[`swal2-input ${styles['inline-elements']}`].join('')} onKeyUp={onKeyUp} />
  </div>
}

const renderHostInput = (domain) => {
  return <div className={styles['elements-wrapper']}>
    <input name='adminHost' id='adminHost' type='text' placeholder='Admin Host' autoComplete='off' className={[`swal2-input ${styles['inline-elements']}`].join('')} onKeyUp={onKeyUp} />
    <span className={styles['inline-elements']}>{domain}</span>
  </div>
}

const renderConfirmStep = () => {
  return <div className={`${styles['elements-wrapper']} ${styles['congrats-box']}`}>
    <p className={styles['congrats-message']}>Congratulations, your Admin App is active!</p>
    <a target='_blank'></a>
  </div>
}

const show = async ({domain, setState, createAdmin, createClasses, createAdminHost, activateLiveQuery, isRoleCreated}) => {
  let adminURL = ''

  const steps = await withReactContent(Swal).mixin(modalOptions).queue([
    {
      title: 'Create an Admin User',
      html: renderUserInputs(setState),
      onBeforeOpen: () => {
        // If there is a admin user, bypass the first step
        isRoleCreated && Swal.clickConfirm()
      },
      preConfirm: async () => {
        try {
          if (!isRoleCreated){
            Swal.showLoading()

            const username = document.getElementById('adminUser').value
            const password = document.getElementById('adminPass').value

            await setState({ username, password })
            await createAdmin()
            await createClasses()
          }
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
          if (!host) throw new Error("Missing admin host")
          await setState({host: host.toLowerCase()})
          adminURL = await createAdminHost()
          await activateLiveQuery()
          await setState({ adminURL })
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
        a.href = a.text = adminURL
      },
      preConfirm: () => {
        if (typeof back4AppNavigation !== 'undefined' && typeof back4AppNavigation.onCreateAdminHostEvent === 'function')
          back4AppNavigation.onCreateAdminHostEvent()
      }
    }
  ])

  return steps.value && steps.value[0] && steps.value[1] && steps.value[2]
}

const B4aAdminModal = { show }

export default B4aAdminModal
