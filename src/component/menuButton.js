/**
*APP上的主界面菜单按钮组件,其中包含两个属性
*icon:button上的icon名称
*title:button的标题
*/
import React, { Component } from 'react';
import {
  View,Text,StyleSheet,TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Iconfont';

import Badge from './badge';
import trans from '../i18/trans';

export default class MenuButton extends Component {
  constructor(props) {
    super(props);
    this.componentOnPress = this.componentOnPress.bind(this);  // 需要在回调函数中使用this,必须使用bind(this)来绑定
  }

  componentOnPress() {
    if (this.props.onPress) {   // 在设置了回调函数的情况下
      this.props.onPress();
    }
  }

  render() {
    return (
      <View style={[styles.menuButton,this.props.style]}>
        <TouchableOpacity onPress={this.componentOnPress}>
          <View style={{flex:1,alignSelf:"stretch",justifyContent :"center",alignItems:"center",width:this.props.style.width-2,height:this.props.style.height-2}}>
            <Icon size={26} color={this.props.iconColor} name={this.props.icon}/>
            <View style={{flexDirection:'row'}}>
              <Text style={styles.title}>{trans(this.props.title)}</Text>
              {
                this.props.badge>0?(
                  <Badge title={this.props.badge}/>
                ):(
                  null
                )
              }
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    menuButton:{
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'white'
    },
    icon: {

    },
    title: {
        padding:5
    }
});
