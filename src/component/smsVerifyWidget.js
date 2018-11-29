/**
*短信校验控件
*/
import React, { Component } from 'react';
import {
  View,Text,TextInput,TouchableOpacity
} from 'react-native';

import Format from '../util/format';
import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';
import {toast,toastX} from '../util/tools';

const SEND_CODE='send code';
const SEND_CODE_LIMIT='send code limit';
const WAIT='wait';
const SECOND='second';

export default class SmsVerifyWidget extends Component {
  timeoutInterval=null;

  constructor(props) {
    super(props);
    this.state={
      count:0,
      title:trans(SEND_CODE)
    }
  }

  changeTitle(){
    if(this.state.count==0){
      this.state.title=trans(SEND_CODE);
    }else{
      this.state.title=trans(WAIT)+this.state.count+trans(SECOND);
    }
    this.setState(this.state);
  }

  sendCode(){
    if(this.state.count==0){
      if(this.props.onMobileCheck()){
        this.props.onSendSms();
        this.smsTimeoutCount();
      }
    }else{
      toastX(SEND_CODE_LIMIT);
    }
  }

  smsTimeoutCount() {
    let _this=this;
    this.state.count=60;
    _this.timeoutInterval=setInterval(function(){
      _this.state.count--;
      if(_this.state.count==0){
        clearInterval(_this.timeoutInterval);
        _this.timeoutInterval=null;
      }
      _this.changeTitle();
    },1000);
  }

  render() {
    return (
      <View style={{flexDirection:'row',alignItems:'flex-end'}}>
        <View style={{flex:2}}>
          <TextInput style={MainStyle.textInput} placeholder={this.props.placeholder} value={this.props.value} onChangeText={(text)=>this.props.onChangeText(text)}/>
        </View>
        <View style={{flex:1}}>
          <TouchableOpacity onPress={()=>this.sendCode()}>
            <Text style={MainStyle.link}>{this.state.title}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
