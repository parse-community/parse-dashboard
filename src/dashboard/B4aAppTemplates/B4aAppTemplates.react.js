import React            from 'react'
import axios            from 'axios'
import InfiniteScroll   from 'react-infinite-scroller';
import DashboardView    from 'dashboard/DashboardView.react';
import subscribeTo      from 'lib/subscribeTo';
import LoaderContainer  from 'components/LoaderContainer/LoaderContainer.react'
import B4AFieldTemplate from 'components/B4AFieldTemplate/B4AFieldTemplate.react';
import Fieldset         from 'components/Fieldset/Fieldset.react';
import styles           from 'dashboard/B4aAppTemplates/B4aAppTemplates.scss'
import Toolbar          from 'components/Toolbar/Toolbar.react';

const APP_TEMPLATES_URL = `${b4aSettings.BACK4APP_API_PATH}/app-templates`
const LEGEND = 'App Templates'
const DESCRIPTION = 'Before starting your project, you can find out if someone has not already done it for you. Along with Back4app, the application code templates help you accelerate the app development cycle, saving months of development.'


@subscribeTo('Schema', 'schema')
class B4aAppTemplates extends DashboardView {
  constructor() {
    super()

    this.state = {
      loading: true,
      appTemplates: [],
      hasMore: false,
      error: undefined
    }

    this.scrollRef = React.createRef();
  }

  async fetchTemplates(currentPage = 1) {
    try {
      const response = await axios.get(`${APP_TEMPLATES_URL}?page=${currentPage}`, { withCredentials: true })
      const { appTemplates = [], hasMore = false } = response && response.data
      await this.setState(prevState => ({ appTemplates: prevState.appTemplates.concat(appTemplates), hasMore }))
    } catch (err) {
      await this.setState({ error: err.response && err.response.data && err.response.data.error || err })
    } finally {
      await this.setState({ loading: false })
    }
  }

  async componentDidMount() {
    await this.fetchTemplates()
    if (typeof back4AppNavigation !== 'undefined' && typeof back4AppNavigation.onOpenAppTemplatePage === 'function')
      back4AppNavigation.onOpenAppTemplatePage()
  }

  getScrollParent() {
    return this.scrollRef.current;
  }

  renderContent() {
    const { appTemplates = [] } = this.state

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
        <InfiniteScroll
          pageStart={1}
          loadMore={this.fetchTemplates.bind(this)}
          hasMore={this.state.hasMore}
          useWindow={false}
          getScrollParent={this.getScrollParent.bind(this)}
          loader={<div className="loader" key={0}>Loading ...</div>}>
          {
            appTemplates.map((template, index) => {
              return template ?
                <B4AFieldTemplate
                  key={index}
                  imageSource={template.imageSource}
                  title={template.title}
                  subtitle={template.subtitle}
                  author={template.author}
                  description={template.description}
                  link={template.link}
                  technologies={template.technologies}
                /> :
                null
            })
          }
        </InfiniteScroll>
      </Fieldset>
    )

    return (
      <div className={styles.loading}>
        <LoaderContainer loading={this.state.loading} hideAnimation={false} solid={true}>
          <div className={styles['app-templates']} ref={this.scrollRef}>
            {fieldSet}
            {toolbar}
          </div>
        </LoaderContainer>
      </div>
    )
  }
}

export default B4aAppTemplates
