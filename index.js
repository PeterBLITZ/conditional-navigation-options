import React from 'react';
import { ReactReduxContext } from 'react-redux';

// The react-navigation use `typeof configurer === 'function'` for checking a type of the navigationOptions
// https://github.com/react-navigation/core/blob/beae50ee1cc727227efbf1bc4d19a4c0780adab7/src/routers/createConfigGetter.js#L7

const defaultOptions = {
  context: ReactReduxContext,
  isFunction: navigationOptions => typeof navigationOptions === 'function',
};

function withCondition(
  Left,
  Right,
  conditionFromState,
  { store: userStore, context, isFunction } = { ...defaultOptions }
) {
  function check() {
    const store = userStore || context._currentValue.store;
    return conditionFromState(store.getState());
  }

  function Conditional(props) {
    return check() ? <Left {...props} /> : <Right {...props} />;
  }

  Conditional.navigationOptions = (...args) => {
    const navigationOptions = check()
      ? Left.navigationOptions
      : Right.navigationOptions;

    return isFunction(navigationOptions)
      ? navigationOptions(...args)
      : navigationOptions;
  };

  return Conditional;
}

export default withCondition;
