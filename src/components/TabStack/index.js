/* @flow */

import React, { PropTypes, Component } from 'react'
import _ from 'lodash'
import CardStack from './../CardStack'
import TabView from './../TabView'
import { normalizePath } from './../../utils'
import type { NavigationState, NavigationLocation, NavigationSceneProps } from './../../types'

type Props = {
  navigationState: NavigationState,
  renderScene: (sceneProps: NavigationSceneProps) => React$Element<any>,
  renderHeader: (sceneProps: NavigationSceneProps) => React$Element<any> | null,
  push: (location: NavigationLocation, callback: Function) => void,
  pop: (callback: Function) => void,
  changeTab: (index: number, callback: Function) => void,
}

type DefaultProps = {
  renderHeader: () => null,
}

type State = {
  navigationState: NavigationState,
}

class TabStack extends Component {

  state: State
  props: Props

  static defaultProps: DefaultProps = {
    renderHeader: () => null,
  }


  // Clone navigation state to it's own
  // in this component and remove circular
  // references
  constructor(props: Props) {
    super(props)
    const { navigationState } = props
    const path = normalizePath(navigationState.path.slice(0, -4))
    const extractedNavigationState = path
      ? _.cloneDeep(_.get(navigationState, path))
      : navigationState
    this.state = {
      navigationState: extractedNavigationState,
    }
  }

  // Dispatch actions
  push = (location: NavigationLocation) => {
    this.props.push(location, this.updateNavigationState)
  }
  changeTab = (index: number) => {
    this.props.changeTab(index, this.updateNavigationState)
  }
  pop = () => {
    this.props.pop(this.updateNavigationState)
  }
  reset = () => {
    this.props.reset()
  }


  // Update local navigation state each
  // time an action is dispatched
  updateNavigationState = (navigationState: NavigationState): void => {
    const path = normalizePath(navigationState.path.slice(0, -4))
    const nextNavigationState = path
      ? _.cloneDeep(_.get(navigationState, path))
      : navigationState
    this.setState({ navigationState: nextNavigationState })
  }


  // Provided updated router context
  static childContextTypes = {
    router: PropTypes.object.isRequired,
  }
  getChildContext() {
    return {
      router: {
        push: this.push,
        pop: this.pop,
        reset: this.reset,
      },
    }
  }


  // Render each tab in a <CardStack />
  // component
  render() {
    return (
      <TabView
        navigationState={this.state.navigationState}
        changeTab={this.changeTab}
        renderScene={(navigationState) => (
          <CardStack
            navigationState={{
              ...navigationState,
              isWrappedInTabs: true,
            }}
            pop={this.pop}
            renderScene={this.props.renderScene}
            renderHeader={(sceneProps) => this.props.renderHeader(sceneProps, this.pop)}
          />
        )}
      />
    )
  }

}

export default TabStack