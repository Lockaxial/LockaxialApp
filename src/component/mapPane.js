/**
*APP上的地图控件，点击打开地图显示
*/
import React, { Component } from 'react';
import {
  View,StyleSheet,Dimensions,WebView
} from 'react-native';
import Gallery from 'react-native-gallery';
import NormalScreen from '../screen/normalScreen';
import MainStyle from '../style/mainStyle';
import AppConf from '../comm/appConf';

const windowSize = Dimensions.get('window');

export default class MapPane extends NormalScreen {
  constructor(props) {
    super(props);
  }

  getMapUrl(){
    return AppConf.APPLICATION_SERVER+'/map.html?lat='+this.props.lat+'&lng='+this.props.lng;
    //return 'http://www.baidu.com';
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <WebView
          style={{paddingTop:400,width:windowSize.width,height:windowSize.height-80}}
          source={{uri:this.getMapUrl()}}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </View>
    );
  }
}
