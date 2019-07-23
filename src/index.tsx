import * as React from 'react';
import {
  NavigationComponent,
  NavigationScreenConfigProps,
  NavigationScreenOptions,
} from 'react-navigation';
import { ReactReduxContext, ReactReduxContextValue } from 'react-redux';
import { Store } from 'redux';

export type BoolFromState = <T>(state: T) => boolean;

export type NavigationOptionsCb = (
  props: NavigationScreenConfigProps,
) => NavigationScreenOptions;

export type NavigationOptions = NavigationScreenOptions | NavigationOptionsCb;

export type IsFunction = (
  navigationOptions: NavigationOptions,
) => navigationOptions is NavigationOptionsCb;

export type ReactContextPublicWrapper = React.Context<
  ReactReduxContextValue
> & {
  _currentValue?: {
    store: Store;
  };
};

export interface Config {
  store?: Store;
  context?: ReactContextPublicWrapper;
  isFunction?: IsFunction;
}

// The react-navigation use `typeof configurer === 'function'` for checking a type of the navigationOptions
// https://github.com/react-navigation/core/blob/beae50ee1cc727227efbf1bc4d19a4c0780adab7/src/routers/createConfigGetter.js#L7

export const isFunctionDefault: IsFunction = (
  navigationOptions,
): navigationOptions is NavigationOptionsCb =>
  typeof navigationOptions === 'function';

const defaultOptions: Config = {
  context: ReactReduxContext,
  isFunction: isFunctionDefault,
};

export default function withCondition(
  Left: NavigationComponent,
  Right: NavigationComponent,
  conditionFromState: BoolFromState,
  config?: Config,
): NavigationComponent {
  const { store: userStore, context, isFunction } = {
    ...defaultOptions,
    ...config,
  };

  if (!Left) {
    throw new Error('left component is not defined');
  }

  if (!Right) {
    throw new Error('right component is not defined');
  }

  if (!conditionFromState || !(conditionFromState instanceof Function)) {
    throw new Error('conditionFromState is not a function');
  }

  function check(): boolean {
    const store = userStore || context._currentValue.store;
    return conditionFromState(store.getState());
  }

  return class Conditional extends React.PureComponent {
    public static navigationOptions: NavigationOptions = args => {
      const navigationOptions = check()
        ? Left.navigationOptions || {}
        : Right.navigationOptions || {};

      return isFunction(navigationOptions)
        ? navigationOptions(args)
        : navigationOptions;
    };

    public render() {
      return check() ? <Left {...this.props} /> : <Right {...this.props} />;
    }
  };
}
