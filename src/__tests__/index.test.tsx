import * as React from 'react';
import { View } from 'react-native';
import { create } from 'react-test-renderer';
import { Store } from 'redux';

import withCondition, {
  BoolFromState,
  isFunctionDefault,
  ReactContextPublicWrapper,
} from '../index';

// Setup ///////////////////////////////////////////////////////////////////

const state = {
  nested: {
    type: 'left',
  },
};

const store: Store = {
  getState: jest.fn(() => state),
  subscribe: jest.fn(),
  replaceReducer: jest.fn(),
  dispatch: jest.fn(),
  [Symbol.observable]: jest.fn(),
};

const context = { _currentValue: { store } } as ReactContextPublicWrapper;

function Left(props: React.FC) {
  return <View {...props}>Left</View>;
}

Left.navigationOptions = {
  headerTitle: 'Left',
};

function Right(props: React.FC) {
  return <View {...props}>Right</View>;
}

Right.navigationOptions = {
  headerTitle: 'Right',
};

function LeftNoNavigationOptions(props: React.FC) {
  return <View {...props}>Left w/o navigationOptions</View>;
}

function RightNoNavigationOptions(props: React.FC) {
  return <View {...props}>Right w/o navigationOptions</View>;
}

function CbNavigationOptions(props: React.FC) {
  return <View {...props}>navigationOptions callback</View>;
}

CbNavigationOptions.navigationOptions = () => ({
  headerTitle: 'navigationOptions callback',
});

const truthySelector: BoolFromState = (currentState: any) =>
  currentState.nested.type === 'left';
const falsySelector: BoolFromState = (currentState: any) =>
  currentState.nested.type === 'right';

// /////////////////////////////////////////////////////////////////////////

describe('isFunctionDefault', () => {
  test('with object', () => {
    const isFunction = isFunctionDefault({});
    expect(isFunction).toBeFalsy();
  });

  test('with function', () => {
    const isFunction = isFunctionDefault(() => ({}));
    expect(isFunction).toBeTruthy();
  });
});

describe('withCondition', () => {
  describe('navigationOptions property', () => {
    test('is exist', () => {
      const Comp = withCondition(Left, Right, truthySelector);
      expect(Comp).toHaveProperty('navigationOptions');
    });

    test('is an instance of a Function', () => {
      const Comp = withCondition(Left, Right, truthySelector);
      expect(Comp.navigationOptions).toBeInstanceOf(Function);
    });
  });

  describe('required params', () => {
    test('Left component is defined', () => {
      const fn = () => withCondition(null, Right, truthySelector, { store });
      expect(fn).toThrow();
    });

    test('Right component is defined', () => {
      const fn = () => withCondition(Left, null, truthySelector, { store });
      expect(fn).toThrow();
    });

    test('conditionFromState function is defined', () => {
      const fn = () => withCondition(Left, Right, null, { store });
      expect(fn).toThrow();
    });
  });

  describe('navigationOptions callback result', () => {
    test('own context', () => {
      const Comp = withCondition(Left, Right, truthySelector, { context });
      expect(Comp.navigationOptions()).toMatchObject(Left.navigationOptions);
    });

    test('truthy selector', () => {
      const Comp = withCondition(Left, Right, truthySelector, { store });
      expect(Comp.navigationOptions()).toMatchObject(Left.navigationOptions);
    });

    test('falsy selector', () => {
      const Comp = withCondition(Left, Right, falsySelector, { store });
      expect(Comp.navigationOptions()).toMatchObject(Right.navigationOptions);
    });

    test('Left component w/o navigationOptions and truthy selector', () => {
      const Comp = withCondition(
        LeftNoNavigationOptions,
        Right,
        truthySelector,
        {
          store,
        },
      );
      expect(Comp.navigationOptions()).toMatchObject({});
    });

    test('Right component w/o navigationOptions and falsy selector', () => {
      const Comp = withCondition(
        Left,
        RightNoNavigationOptions,
        falsySelector,
        {
          store,
        },
      );
      expect(Comp.navigationOptions()).toMatchObject({});
    });

    test('Left component with navigationOptions callback', () => {
      const Comp = withCondition(CbNavigationOptions, Right, truthySelector, {
        store,
      });
      expect(Comp.navigationOptions()).toMatchObject(
        CbNavigationOptions.navigationOptions(),
      );
    });
  });

  describe('to match snapshot', () => {
    test('truthy selector', () => {
      const Comp = withCondition(Left, Right, truthySelector, { store });
      const tree = create(<Comp />).toJSON();
      expect(tree).toMatchSnapshot();
    });

    test('falsy selector', () => {
      const Comp = withCondition(Left, Right, falsySelector, { store });
      const tree = create(<Comp />).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
