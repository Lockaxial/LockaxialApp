/**
*相框编辑页面
*/
import React, { Component } from 'react';
import {
  View,Text,TextInput
} from 'react-native';
import {Button} from 'react-native-elements';

import ImageControl from '../component/imageControl';
import NormalScreen from './normalScreen';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import deviceDao from '../model/deviceDao';

const LABEL_CONFIRM='confirm';
const LABEL_CANCEL='cancel';

export default class PhotoScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      images:deviceDao.images
    }
  }

  /**
  *保存相框
  */
  savePhoto(){
    let _this=this;
    deviceDao.save(function(result){
      if(result.code==0){
        _this.back();
      }
    });
  }

  onImageChange(images){
    this.state.images=images;
    this.state(this.state);
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <ImageControl images={this.state.images} onChange={(images)=>this.onImageChange(images)} style={{padding:20}}></ImageControl>
        <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,flexDirection:'row',alignItems:'center'}}>
          <View style={{flex:1}}><Button onPress={()=>this.back()} title={trans(LABEL_CANCEL)}/></View>
          <View style={{flex:1}}><Button backgroundColor='#007aff' onPress={()=>this.savePhoto()} title={trans(LABEL_CONFIRM)}/></View>
        </View>
      </View>
    );
  }
}
