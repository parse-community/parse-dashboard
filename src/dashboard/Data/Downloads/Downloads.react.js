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
import Chart                     from 'components/Chart/Chart.react';
import { ChartColorSchemes }     from 'lib/Constants';
import EmptyState    from 'components/EmptyState/EmptyState.react';
import * as AJAX     from 'lib/AJAX';

export default class Downloads extends DashboardView {

  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Downloads';

    this.state = {
      method: 'POST',
      endpoint: '',
      useMasterKey: false,
      runAsIdentifier: '',
      sessionToken: null,
      parameters: '',
      response: {results:[]},
      fetchingUser: false,
      inProgress: false,
      error: false,
      curlModal: false
    };
    
    this.displaySize = {
      width: 800,
      height: 400
    };
    
    this.chartData = {
          'Group A': {
            color: ChartColorSchemes[0],
            points: [[1462060800000,51],[1430524800000,66],[1425340800000,36], [1433548800000, 10]]
          },
          'Group B': {
            color: ChartColorSchemes[1],
            points: [[1462060800000,40],[1430524800000,24],[1425340800000,12], [1433548800000, 20]]
          },
        };
  }
  
  renderEmpty() {
    return (
      <EmptyState
        title='No download data found'
        description='We have not found any data for your app.'
        icon='collaborate-outline' />
    );
  }
  
  renderContent() {
    var legend = 'Results';
    return (
      <div style={{ padding: '120px 0 60px 0' }}>
        <Fieldset
          legend={legend}
          description=''>
          
          <Chart  width={this.displaySize.width} 
                  height={this.displaySize.height} 
                  data={this.chartData} />

        </Fieldset>
        <Toolbar section='Core' subsection='Downloads' />
      </div>
    );
  }
}

Downloads.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
};
