import * as React from 'react';
import { Store } from 'redux';
import { ReactReduxContext, ReactReduxContextValue } from 'react-redux';
import {
  NavigationScreenOptions,
  NavigationScreenConfigProps,
  NavigationComponent,
} from 'react-navigation';

// The react-navigation use `typeof configurer === 'function'` for checking a type of the navigationOptions
// https://github.com/react-navigation/core/blob/beae50ee1cc727227efbf1bc4d19a4c0780adab7/src/routers/createConfigGetter.js#L7

export type BoolFromState = <T>(state: T) => boolean;

export type NavigationOptionsCb = (
  props: NavigationScreenConfigProps
) => NavigationScreenOptions;

export type NavigationOptions = NavigationScreenOptions | NavigationOptionsCb;

export interface Config {
  store?: Store;
  context: React.Context<ReactReduxContextValue> & {
    _currentValue?: {
      store: Store;
    };
  };
  isFunction: (
    navigationOptions: NavigationOptions
  ) => navigationOptions is NavigationOptionsCb;
}

const defaultOptions: Config = {
  context: ReactReduxContext,
  isFunction: (navigationOptions): navigationOptions is NavigationOptionsCb =>
    typeof navigationOptions === 'function',
};

export default function withCondition(
  Left: NavigationComponent,
  Right: NavigationComponent,
  conditionFromState: BoolFromState,
  { store: userStore, context, isFunction }: Config = { ...defaultOptions }
): NavigationComponent {
  function check(): boolean {
    const store = userStore || context._currentValue.store;
    return conditionFromState(store.getState());
  }

  return class Conditional extends React.PureComponent {
    static navigationOptions: NavigationOptions = args => {
      const navigationOptions = check()
        ? Left.navigationOptions
        : Right.navigationOptions;

      return isFunction(navigationOptions)
        ? navigationOptions(args)
        : navigationOptions;
    };

    render() {
      return check() ? <Left {...this.props} /> : <Right {...this.props} />;
    }
  };
}
