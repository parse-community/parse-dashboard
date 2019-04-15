import React            from 'react'
import axios            from 'axios'
import DashboardView    from 'dashboard/DashboardView.react';
import subscribeTo      from 'lib/subscribeTo';
import LoaderContainer  from 'components/LoaderContainer/LoaderContainer.react'
import B4AFieldTemplate from 'components/B4AFieldTemplate/B4AFieldTemplate.react';
import Fieldset         from 'components/Fieldset/Fieldset.react';
import Label            from 'components/Label/Label.react';
import Button           from 'components/Button/Button.react';
import styles           from 'dashboard/B4aAppTemplates/B4aAppTemplates.scss'
import Toolbar          from 'components/Toolbar/Toolbar.react';
import Icon             from 'components/Icon/Icon.react';


const APP_TEMPLATES_URL = `${b4aSettings.BACK4APP_API_PATH}/app-templates`
const LEGEND = 'You don’t need to start from the scratch'
const DESCRIPTION = 'Before starting your project, you can find out if someone has not already done it for you. Along with Back4app, the application code templates help you accelerate the app development cycle, saving months of development.'


@subscribeTo('Schema', 'schema')
class B4aAppTemplates extends DashboardView {
  constructor() {
    super()

    this.state = {
      loading: true,
      templates: [],
      error: undefined
    }

  }

  async fetchTemplates() {
    try {
      const response = await axios.get(APP_TEMPLATES_URL)
      await this.setState({ templates: response && response.data || [] })
    } catch (err) {
      await this.setState({ error: err.response && err.response.data && err.response.data.error || err })
    } finally {
      await this.setState({ loading: false })
    }
  }

  async componentDidMount() {
    await this.fetchTemplates()
  }

  renderContent() {
    const { templates = [] } = this.state

    const toolbar = (
      <Toolbar
        section='App Templates'>
      </Toolbar>
    );

    const fieldSet = (
      <Fieldset
        legend={LEGEND}
        description={DESCRIPTION}
        width= '90%'>
        {
          templates.map(template => {
            return template ?
              <B4AFieldTemplate
                imageSource={template.imageSource}
                title={template.title}
                subtitle={template.subtitle}
                author={template.author}
                text={template.description}
                link={template.link}
              /> :
              null
          })
        }
      </Fieldset>
    )

    console.log('state', fieldSet)

    return (
      <LoaderContainer className={styles.loading} loading={this.state.loading} hideAnimation={false} solid={true}>
        <div className={styles['app-templates']}>
          {fieldSet}
          {toolbar}
        </div>
      </LoaderContainer>
    )
  }
}

export default B4aAppTemplates
