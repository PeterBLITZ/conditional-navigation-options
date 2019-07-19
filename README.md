# The HOC that achieve applying navigation options based on the store selector.

## How to install

`npm i conditional-navigation-options`

or

`yarn add conditional-navigation-options`

## How to use

```
import React from 'react';
import { View, Text } from 'react-native';
import withCondition from 'conditional-navigation-options';

function Main(props) {
  return (
    <View {...props}>
      <Text>Main</Text>
    </View>
  );
}

Main.navigationOptions = {
  headerTitle: 'Main',
};

function AccessDenied(props) {
  return (
    <View {...props}>
      <Text>Access denied</Text>
    </View>
  );
}

AccessDenied.navigationOptions = {
  headerTitle: 'Access denied',
};

const roleSelector = state => state.auth.role === 'admin';

export default withCondition(Main, AccessDenied, roleSelector);
```
