/**
*信息输入对话框
*/
import React, { Component } from 'react';
import {
  View,Text,StyleSheet,TouchableOpacity,TextInput
} from 'react-native';
import { Icon,Button } from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';

const CANCEL_BUTTON='cancel';
const CONFIRM_BUTTON='confirm';

export default class InputScreen extends NormalScreen {
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
    this.back();
  }

  onRightButtonPress(){
    if(this.props.options.rightCallback){
      this.props.options.rightCallback(this.state.textValue);
    }
    this.back();
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <Text style={MainStyle.label}>{trans(this.props.options.title)}</Text>
        <TextInput style={MainStyle.textInput} placeholder={this.props.options.content?trans(this.props.options.content):''} onChangeText={(text) => {this.state.textValue=text;this.setState(this.state);}}/>
        <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,flexDirection:'row',alignItems:'center'}}>
          <View style={{flex:1}}><Button onPress={()=>this.onLeftButtonPress()} title={trans(this.state.leftButton)}/></View>
          <View style={{flex:1}}><Button backgroundColor='#007aff' onPress={()=>this.onRightButtonPress()} title={trans(this.state.rightButton)}/></View>
        </View>
      </View>
    );
  }
}
