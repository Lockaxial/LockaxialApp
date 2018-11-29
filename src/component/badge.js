/**
*提示Badge组件
*/
import React, { Component } from 'react';
import {
  Text,View
} from 'react-native';

export default class Badge extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{backgroundColor:'#da4f49',height:18,borderRadius:9}}><Text style={{paddingLeft:6,paddingRight:6,color:'#fff',backgroundColor:'rgba(0,0,0,0)'}}>{this.props.title}</Text></View>
    );
  }
}
