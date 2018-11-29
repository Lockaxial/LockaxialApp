/**
*信息提示对话框
*/
import React, { Component } from 'react';
import {
  View,Text,TouchableOpacity
} from 'react-native';
import { Icon } from 'react-native-elements';

import BaseDialog from './baseDialog';
import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';

const OK_BUTTON='ok';

export default class InfoDialog extends BaseDialog {
  constructor(props) {
    super(props);
    let buttons={
      leftButton:null
    };
    if(this.props.options.leftButton){
      buttons.leftButton=this.props.options.leftButton;
    }else{
      buttons.leftButton=OK_BUTTON;
    }
    this.state=buttons;
  }

  onLeftButtonPress(){
    if(this.props.options.leftCallback){
      this.props.options.leftCallback();
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
              <View style={{padding:15,padding:15}}><Text>{this.props.options.content}</Text></View>
          )
      }
      <TouchableOpacity onPress={()=>this.onLeftButtonPress()}>
        <View style={{padding:15,borderTopColor:'#dedede',borderTopWidth:1,alignItems:'center'}}>
          <Text style={{color:'#007aff',alignSelf:'center'}}>{trans(this.state.leftButton)}</Text>
        </View>
      </TouchableOpacity>
    </View>
    );
  }
}
