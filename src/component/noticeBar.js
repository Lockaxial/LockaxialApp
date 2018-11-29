/**
*APP上的主界面上的通知公告栏目，其中包含两个属性
*icon:条目最前面的icon图标,为本地图片格式
*/
import React, { Component } from 'react';
import {
  DeviceEventEmitter,View,TouchableOpacity,Text
} from 'react-native';
import Icon from 'react-native-vector-icons/Iconfont';
import noticeDao from '../model/noticeDao';
import trans from '../i18/trans';
import Filter from '../util/filter';
import MainStyle from '../style/mainStyle';

const NO_NOTICE='no notice';
const LABEL_UNREAD='unread';

export default class NoticeBar extends Component {
  constructor(props) {
    super(props);
    this.state={
      unreadNoticeNumber:0,
      lastNoticeTitle:trans(NO_NOTICE),
      lastNoticeTime:''
    };
    this.initData();
    //this.componentOnPress = this.componentOnPress.bind(this);  // 需要在回调函数中使用this,必须使用bind(this)来绑定
  }

  /**
  *从noticeDao中获取最新的广告概要信息
  */
  initData(){
    this.state.unreadNoticeNumber=noticeDao.unreadNoticeNumber;
    if(noticeDao.list.length>0){
      this.state.lastNoticeTitle=noticeDao.list[0].noticeTitle;
      this.state.lastNoticeTime=Filter.datetimeFilter(noticeDao.list[0].creDate);
    }else{
      this.state.lastNoticeTitle=trans(NO_NOTICE);
      this.state.lastNoticeTime='';
    }
  }

  /**
  *当此组件中显示完成后，注册一个changeNoticeProfile事件侦听，当公告信息产生变化时，更新显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeNoticeProfile',(data)=>this.changeNoticeProfile(data)); //注册一个changeNoticeProfile消息，触发该消息时调用更新公告栏
  }

  /**
  *组件删除后，一并删除事件侦听
  */
  componentWillUnmount(){
    this.subscription.remove(); //页面销毁时注销消息事件
  }

  changeNoticeProfile(){
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
      <TouchableOpacity onPress={()=>this.componentOnPress()}>
        <View style={{paddingTop:8,flexDirection:'row',backgroundColor:'white',borderBottomColor:'#eeeeee',borderBottomWidth:1}}>
          <View style={{flex:1,alignItems:'center'}}><Icon size={30} name="tongzhi" color="#da4f49"/></View>
          <View style={{flex:6,paddingBottom:8}}>
            <Text>{this.state.lastNoticeTitle}</Text>
            <View style={{flexDirection:'row'}}>
              <Text style={{flex:4,fontSize:12}}>{this.state.lastNoticeTime?(this.state.lastNoticeTime):''}</Text>
              <Text style={{flex:1,color:'#da4f49',fontSize:12}}>{this.state.unreadNoticeNumber+trans(LABEL_UNREAD)}</Text>
            </View>
          </View>
        </View>
     </TouchableOpacity>
    );
  }
}
