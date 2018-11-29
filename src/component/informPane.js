/**
*内容详情组件
*/
import React, { Component } from 'react';
import {
  View,Text
} from 'react-native';
import { Icon } from 'react-native-elements';

import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';

export default class InformPane extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <View style={{marginTop:150}}>
          <Text style={{paddingTop:12,fontSize:18,alignSelf:'center',color:'#cacaca'}}>{this.props.title}</Text>
        </View>
      </View>
    );
  }
}
