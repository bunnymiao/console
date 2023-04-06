/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react'
import { Router } from 'react-router'
import { createBrowserHistory } from 'history'
import { Provider } from 'mobx-react'
import { syncHistoryWithStore } from 'mobx-react-router'
import { renderRoutes } from 'utils/router.config'
import { lazy } from 'utils'
import appendSvg from 'utils/svgSpirits'

import RootStore from 'stores/root'

import '@kube-design/components/esm/styles/index.scss'
import 'scss/main.scss'

import routes from './routes'

const getActions = lazy(() =>
  import(/* webpackChunkName: "actions" */ 'actions')
)

class App extends Component {
  constructor(props) {
    super(props)

    this.rootStore = new RootStore()
    this.history = syncHistoryWithStore(
      createBrowserHistory({ basename: 'consolev3' }),
      this.rootStore.routing
    )
  }

  componentWillMount() {
    if (!document.getElementById('__SVG_SPRITE_NODE__')) {
      appendSvg()
      window.iconfont__svg__inject = true
    }
  }

  componentWillUnmount() {
    this.unlisten()
  }

  componentDidMount() {
    getActions().then(actions =>
      this.rootStore.registerActions(actions.default)
    )

    window.$wujie?.bus.$on('triggerAction', (name, params) => {
      if (this.rootStore.actions[name]) {
        this.rootStore.actions[name].on(params)
      }
    })

    this.unlisten = this.history.listen(location => {
      window.$wujie?.bus.$emit('subRouteChange', 'consolev3', location)
    })
  }

  render() {
    return (
      <Provider rootStore={this.rootStore}>
        <Router history={this.history}>{renderRoutes(routes)}</Router>
      </Provider>
    )
  }
}

export default App
