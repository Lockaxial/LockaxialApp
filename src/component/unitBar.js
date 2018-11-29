/**
*APP上的主界面上的房屋条,用于展示当前所住的房屋
*/
import React, { Component } from 'react';
import {
  DeviceEventEmitter,View,Text,Dimensions,TouchableWithoutFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/Iconfont';
import accountDao from '../model/accountDao';
import trans from '../i18/trans';

const NO_LOGIN='no login';
const NO_UNIT='no unit';
const windowSize = Dimensions.get('window');

export default class UnitBar extends Component {
  constructor(props) {
    super(props);
    this.state={
      choosedUnitName:trans(NO_LOGIN)
    };
    this.initData();
  }

  /**
  *从accountDao中获取最新的房屋信息
  */
  initData(){
    if(accountDao.userInfo.rid>0){
      if(accountDao.currentUnit){
        this.state.choosedUnitName=accountDao.currentUnit.unitName;
      }else{
        this.state.choosedUnitName=trans(NO_UNIT);
      }
    }else{
      this.state.choosedUnitName=trans(NO_LOGIN);
    }
  }

  /**
  *当此组件中显示完成后，注册一个changeUserAccount事件侦听，当公告信息产生变化时，更新显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeUserAccount',(data)=>this.changeUserAccount(data)); //注册一个changeUserAccount消息，触发该消息时调用更新
  }

  /**
  *组件删除后，一并删除事件侦听
  */
  componentWillUnmount(){
    this.subscription.remove(); //页面销毁时注销消息事件
  }

  /**
  *当账户信息或者选择的房屋改变后，触发消息，进行刷新
  */
  changeUserAccount(){
    this.initData();
    this.setState(this.state);
  }

  componentOnPress() {
    if (this.props.onPress) {   // 在设置了回调函数的情况下
      this.props.onPress();
    }
  }

  render() {
    return (
      <View>
        <View style={{position:'absolute',left:0,top:0,width:windowSize.width,height:40,backgroundColor:'black',opacity:0.2}}>
        </View>
        <TouchableWithoutFeedback onPress={()=>this.componentOnPress()}>
          <View style={{position:'absolute',left:0,top:0,width:windowSize.width,padding:10,height:40,flexDirection: 'row'}}>
            <Icon name='weizhi' size={20} color='white' style={{backgroundColor: 'rgba(0,0,0,0)'}}/>
            <Text style={{color:'white',marginLeft:10,backgroundColor: 'rgba(0,0,0,0)'}}>{this.state.choosedUnitName}</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}
