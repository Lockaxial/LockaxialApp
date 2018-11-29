/**
*内容详情组件
*/
import React, { Component } from 'react';
import {
  View,Text,ScrollView
} from 'react-native';
import { Icon } from 'react-native-elements';

import ImageWidget from './imageWidget';
import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';
import Filter from '../util/filter';

export default class ContentPane extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ScrollView style={{margin:15}}>
        <Text style={{fontSize:18,alignSelf:'center'}}>{this.props.title}</Text>
        <Text style={{color:'#999999',fontSize:12,paddingTop:10}}>{Filter.datetimeFilter(this.props.datetime)}</Text>
        <Text style={{paddingTop:10,paddingBottom:10}}>{this.props.content}</Text>
        {
          (this.props.images&&this.props.images.length>0)?(
            <ImageWidget images={this.props.images} screen={this.props.screen}></ImageWidget>
          ):(null)
        }
      </ScrollView>
    );
  }
}
