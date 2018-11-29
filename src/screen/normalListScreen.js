/**
*子页面基础类
*/
import React, { Component } from 'react';
import {
  View,ActivityIndicator,Text
} from 'react-native';

import NormalScreen from './normalScreen';
import {toastX} from '../util/tools';

const MSG_NO_DATA='no data';

export default class NormalListScreen extends NormalScreen {
  listControl={
    loadState:0  //0:准备刷新，1:正在刷新 -1:无新数据
  };

  isFirstPage(){
    return this.state.list.getRowCount()<20;
  }

  beforeListRefresh(){
    if(this.isFirstPage()){
      return true;
    }else if(this.listControl.loadState==-1){
      return true;
    }else{
      this.listControl.loadState=1;
      this.setState(this.state);
      return false;
    }
  }

  afterListRefresh(length){
    if(length>0){
      this.listControl.loadState=0;
    }else{
      this.listControl.loadState=-1;
    }
  }

  renderRooter(){
    if(this.listControl.loadState==-1){
      toastX(MSG_NO_DATA);
      return null;
    }else if(this.listControl.loadState==1){
      return(
        <View>
          <ActivityIndicator size="large"/>
        </View>
      );
    }else{
      return null;
    }
  }
}
