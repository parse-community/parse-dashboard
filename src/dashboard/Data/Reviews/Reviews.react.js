/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button        from 'components/Button/Button.react';
import Icon          from 'components/Icon/Icon.react';
import DashboardView from 'dashboard/DashboardView.react';
import Dropdown      from 'components/Dropdown/Dropdown.react';
import Field         from 'components/Field/Field.react';
import Fieldset      from 'components/Fieldset/Fieldset.react';
import fieldStyle    from 'components/Field/Field.scss';
import FlowFooter    from 'components/FlowFooter/FlowFooter.react';
import FormNote      from 'components/FormNote/FormNote.react';
import generateCurl  from 'dashboard/Data/ApiConsole/generateCurl';
import JsonPrinter   from 'components/JsonPrinter/JsonPrinter.react';
import Label         from 'components/Label/Label.react';
import Modal         from 'components/Modal/Modal.react';
import Option        from 'components/Dropdown/Option.react';
import Parse         from 'parse';
import ParseApp      from 'lib/ParseApp';
import React         from 'react';
import request       from 'dashboard/Data/ApiConsole/request';
import styles        from 'dashboard/Data/ApiConsole/ApiConsole.scss';
import TextInput     from 'components/TextInput/TextInput.react';
import Toggle        from 'components/Toggle/Toggle.react';
import Toolbar       from 'components/Toolbar/Toolbar.react';
import stylesTable   from 'dashboard/TableView.scss';
import EmptyState    from 'components/EmptyState/EmptyState.react';
import * as AJAX     from 'lib/AJAX';
import LoaderContainer  from 'components/LoaderContainer/LoaderContainer.react';
import AppsManager   from 'lib/AppsManager';

export default class Reviews extends DashboardView {

  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Reviews';

    this.state = {
      method: 'POST',
      endpoint: '',
      useMasterKey: false,
      runAsIdentifier: '',
      sessionToken: null,
      parameters: '',
      response: null,
      fetchingUser: false,
      inProgress: false,
      error: false,
      curlModal: false,
      loading: true,
      maxStars: 5
    };
  }
  
  makeRequest() {
    let path = 'http://api.colubris.com.br/publiq/classes/Reviews?where={"applicationId":"' + this.context.currentApp.applicationId + '"}';
    let apps = AppsManager.apps();
    let masterApp = apps.filter(function(app) {
      return app.masterApp == true; // if truthy then keep item
    });
    let headers = null;
    if(masterApp.length > 0) {
      headers = {
        'X-Parse-Application-Id': masterApp[0].applicationId,
        'X-Parse-REST-API-Key': masterApp[0].restKey,
        'X-Parse-Master-Key': masterApp[0].masterKey,
        'Content-Type': 'application/json'
      };
    }
    let promise = AJAX.getReviews(path, '', headers);
    promise.then((response) => {
      this.setState({ response });
      this.setState({loading: false})
    });
  }
  
  renderEmpty() {
    return (
      <EmptyState
        title='No reviews'
        description='We have not found any reviews for your app.'
        icon='collaborate-outline' />
    );
  }
  
  renderContent() {
    let content = (<div style={{ padding: '120px 0 60px 0' }}>
                  <Toolbar section='Core' subsection='Reviews' /></div>);
    let legend = 'Results';
    if(this.state.response == null) {
      this.makeRequest();  
    } else {
      if(this.state.response.results.length == 0) {
        content = (
          <div style={{ padding: '120px 0 500px 0' }}>
            {this.renderEmpty()}
            <Toolbar section='Core' subsection='Reviews' />
          </div>
        );
      } else {
        content = (<Fieldset
            legend={legend}
            description=''>
            
            {this.state.response.results.map((review) =>
              <div key={review.reviewId} style={{ padding: '10px 10px 10px 10px' }} className={fieldStyle.field}>
                <span><b>{review.reviewAuthor}({review.reviewAppVersion}) </b></span>
                {[0,1,2,3,4].map((x, i) => {
                    if(i <= review.reviewRating - 1) {
                        return <Icon key={i} name='star' fill='#000000' width={20} height={20} />
                    } else {
                        return <Icon key={i} name='star' fill='#FFFFFF' width={20} height={20} />
                  }})}
                <br/>
                <span>{review.reviewTitle}</span><br/>
                <span>{review.reviewContent}</span><br/><br/>
                <Icon name={review.device} fill='#00db7c' width={20} height={20} />
              </div>
            )}
          </Fieldset>);
        }
    }
    
    return (
      <div style={{ padding: '120px 0 60px 0' }}>
        <LoaderContainer loading={this.state.loading} solid={false}>
          {content}
        </LoaderContainer>
        <Toolbar section='Core' subsection='Reviews' />
      </div>
    );
  }
}

Reviews.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
