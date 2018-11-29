/**
*信息输入对话框
*/
import React, { Component } from 'react';
import {
  View,Text,StyleSheet,TouchableOpacity,TextInput
} from 'react-native';
import { Icon } from 'react-native-elements';

import BaseDialog from './baseDialog';
import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';

const CANCEL_BUTTON='cancel';
const CONFIRM_BUTTON='confirm';

export default class InputDialog extends BaseDialog {
  constructor(props) {
    super(props);
    let thisState={
      leftButton:null,
      rightButton:null,
      textValue:''
    };
    if(this.props.options.leftButton){
      thisState.leftButton=this.props.options.leftButton;
    }else{
      thisState.leftButton=CANCEL_BUTTON;
    }
    if(this.props.options.rightButton){
      thisState.rightButton=this.props.options.rightButton;
    }else{
      thisState.rightButton=CONFIRM_BUTTON;
    }
    this.state=thisState;
  }

  onLeftButtonPress(){
    if(this.props.options.leftCallback){
      this.props.options.leftCallback();
    }
    this.props.navigator.dismissModal();
  }

  onRightButtonPress(){
    if(this.props.options.rightCallback){
      this.props.options.rightCallback(this.state.textValue);
    }
    this.props.navigator.dismissModal();
  }

  renderDialog() {
    return (
      <View>
        <View style={{margin:40}}>
          <TextInput
              placeholder={this.props.options.content?trans(this.props.options.content):''}
              onChangeText={(text) => {this.state.textValue=text;this.setState(this.state);}}
            />
        </View>
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
