/**
*APP上的弹出的对话框基类
*options 是打开对话框时传过来的参数
*/
import React, { Component } from 'react';
import {
  View,Text,Dimensions
} from 'react-native';
import { Icon } from 'react-native-elements';

import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';

const windowSize = Dimensions.get('window');
const dialogWidth=windowSize.width*0.7;

export default class BaseDialog extends Component {
  static navigatorStyle = {
    tabBarHidden: true,
    navBarHidden: true //隐藏顶部导航
  };

  constructor(props) {
    super(props);
  }

  renderDialog(){
    return(null);
  }

  render() {
    return (
      <View style={{marginTop:200,alignSelf:'center',backgroundColor:'#e8e8e8',borderRadius:10,width:dialogWidth}}>
        {
          (!this.props.options.title)?(
               null
           ) : (
               <View style={{padding:15,borderBottomColor:'#dedede',borderBottomWidth:1}}><Text style={{alignSelf:'center'}}>{trans(this.props.options.title)}</Text></View>
           )
        }
        {this.renderDialog()}
      </View>
    );
  }
}
