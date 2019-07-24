[![Build Status](https://travis-ci.org/PeterBLITZ/conditional-navigation-options.svg?branch=master)](https://travis-ci.org/PeterBLITZ/conditional-navigation-options)
[![codecov](https://codecov.io/gh/PeterBLITZ/conditional-navigation-options/branch/master/graph/badge.svg)](https://codecov.io/gh/PeterBLITZ/conditional-navigation-options)
![npm](https://img.shields.io/npm/v/conditional-navigation-options.svg)
![npm](https://img.shields.io/npm/dm/conditional-navigation-options.svg)

# The HOC that achieve applying navigation options based on the store selector.

## Install

`npm i conditional-navigation-options`

or

`yarn add conditional-navigation-options`

## Live example

https://snack.expo.io/@peterblitz/conditional-navigation-options

## How to use

```
import React, { useCallback } from 'react';
import { Text, View, Button } from 'react-native';
import { createStore } from 'redux';
import { Provider, useDispatch } from 'react-redux';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import withCondition from 'conditional-navigation-options';

function Home({ navigation }) {
  const dispatch = useDispatch();
  const navigateToMain = useCallback(() => navigation.navigate('Main'));
  const setAccess = access =>
    useCallback(() => dispatch({ type: 'SET_ACCESS', payload: access }), [
      dispatch,
    ]);

  return (
    <View style={{ flex: 1, padding: 50 }}>
      <Button onPress={navigateToMain} title="Navigate to Main" />
      <View style={{ height: 50 }} />
      <Button onPress={setAccess('grant')} title="Grant access" color="green" />
      <View style={{ height: 20 }} />
      <Button onPress={setAccess('denied')} title="Deny access" color="red" />
    </View>
  );
}

Home.navigationOptions = {
  title: 'Home',
};

function Granted() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Access granted</Text>
    </View>
  );
}

Granted.navigationOptions = {
  title: 'Access granted',
};

function Denied() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Access denied</Text>
    </View>
  );
}

Denied.navigationOptions = {
  title: 'Access denied',
};

const reducer = (state = 'denied', action) => {
  switch (action.type) {
    case 'SET_ACCESS':
      return action.payload;
    default:
      return state;
  }
};

const store = createStore(reducer);

const AppNavigator = createAppContainer(
  createStackNavigator({
    Home,
    Main: withCondition(Granted, Denied, state => state === 'grant'),
  })
);

export default function App() {
  return (
    <Provider store={store}>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <AppNavigator />
      </View>
    </Provider>
  );
}
```
