/**
*信息确认对话框
*/
import React, { Component } from 'react';
import {
  View,Text,StyleSheet,TouchableOpacity
} from 'react-native';
import { Icon } from 'react-native-elements';

import BaseDialog from './baseDialog';
import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';

const CANCEL_BUTTON='cancel';
const CONFIRM_BUTTON='confirm';

export default class ConfirmDialog extends BaseDialog {
  constructor(props) {
    super(props);
    let buttons={
      leftButton:null,
      rightButton:null
    };
    if(this.props.options.leftButton){
      buttons.leftButton=this.props.options.leftButton;
    }else{
      buttons.leftButton=CANCEL_BUTTON;
    }
    if(this.props.options.rightButton){
      buttons.rightButton=this.props.options.rightButton;
    }else{
      buttons.rightButton=CONFIRM_BUTTON;
    }
    this.state=buttons;
  }

  onLeftButtonPress(){
    if(this.props.options.leftCallback){
      this.props.options.leftCallback();
    }
    this.props.navigator.dismissModal();
  }

  onRightButtonPress(){
    if(this.props.options.rightCallback){
      this.props.options.rightCallback();
    }
    this.props.navigator.dismissModal();
  }

  renderDialog() {
    return (
      <View>
      {
         (!this.props.options.content)?(
              null
          ) : (
              <View style={{padding:15}}><Text>{trans(this.props.options.content)}</Text></View>
          )
      }
      <View style={{padding:15,borderTopColor:'#dedede',borderTopWidth:1,flexDirection: 'row',alignItems:'center'}}>
        <View style={{flex:1,borderRightColor:'#dedede',borderRightWidth:1}}>
          <TouchableOpacity onPress={()=>this.onLeftButtonPress()}>
            <Text style={{color:'#007aff',alignSelf:'center'}}>{trans(this.state.leftButton)}</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex:1}}>
          <TouchableOpacity onPress={()=>this.onRightButtonPress()}>
            <Text style={{color:'#007aff',alignSelf:'center'}}>{trans(this.state.rightButton)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    );
  }
}
