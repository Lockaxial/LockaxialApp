/**
*所有优惠券列表页面
*/
import React, { Component } from 'react';
import {
  View,Text
} from 'react-native';

import NormalScreen from './normalScreen';
import MainStyle from '../style/mainStyle';
import CouponMain from './couponMain';

export default class AboutScreen extends NormalScreen {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <CouponMain shopId={0} screen={this}/>
      </View>
    );
  }
}
