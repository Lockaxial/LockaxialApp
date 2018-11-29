/**
*商铺详情页面
*/
import React, { Component } from 'react';
import {
  View,Text,TouchableOpacity,ListView,ScrollView,DeviceEventEmitter,Dimensions,Image
} from 'react-native';

import NormalScreen from './normalScreen';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toastX} from '../util/tools';
import Filter from '../util/filter';
import GoodsPane from '../component/goodsPane';

const windowSize = Dimensions.get('window');

export default class GoodsDetailScreen extends NormalScreen {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ScrollView style={MainStyle.screen}>
        <GoodsPane size={{width:3,height:2}} item={this.props.item} screen={this}>
        </GoodsPane>
        <View style={{margin:10}}>
          <Text>{this.props.item.content}</Text>
        </View>
        {
          this.props.item.images.map((image,i)=>
          <Image source={{uri:image}} key={i} style={{width:windowSize.width,height:windowSize.width,marginBottom:10}}></Image>
          )
        }
      </ScrollView>
    );
  }
}
