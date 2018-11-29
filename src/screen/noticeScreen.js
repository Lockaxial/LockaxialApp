/**
*物业公告列表页面
*/
import React, { Component } from 'react';
import {
  ListView,DeviceEventEmitter,View,ActivityIndicator,Text
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalListScreen from './normalListScreen';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import noticeDao from '../model/noticeDao';
import Filter from '../util/filter';
import MainStyle from '../style/mainStyle';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源

export default class NoticeScreen extends NormalListScreen {
  constructor(props) {
    super(props);
    this.state={
      list:ds.cloneWithRows(noticeDao.list)
    };
  }

  /**
  *更新列表数据
  */
  changeNoticeList(){
    this.state.list=ds.cloneWithRows(noticeDao.list);
    this.setState(this.state);
  }

  /**
  *打开通知公告详细页
  */
  openDetailScreen(rowID){
    noticeDao.item=noticeDao.list[rowID];
    this.openScreen('NoticeDetailScreen');
    noticeDao.updateAccessStatus(noticeDao.item);
  }

  /**
  *相应列表更新后的事件
  */
  onPageRefresh(){
    if(this.beforeListRefresh()){
      return;
    }
    var _this=this;
    noticeDao.load(function(result){
      _this.afterListRefresh(result.data.length);
      _this.changeNoticeList();
    });
  }

  /**
  *当此组件中显示完成后，注册一个changeNoticeList事件侦听，当公告信息产生变化时，更新显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeNoticeList',(data)=>this.changeNoticeList()); //注册一个changeNoticeProfile消息，触发该消息时调用更新公告栏
  }

  /**
  *组件删除后，一并删除事件侦听
  */
  componentWillUnmount(){
    this.subscription.remove(); //页面销毁时注销消息事件
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <List containerStyle={MainStyle.list}>
          <ListView
            enableEmptySections
            dataSource={this.state.list}
            onEndReached={()=>this.onPageRefresh()}
            onEndReachedThreshold={10}
            renderFooter={()=>this.renderRooter()}
            renderRow={(item, sectionID, rowID) =>
                item.accessId>0?(
                  <ListItem onPress={()=>this.openDetailScreen(rowID)} key={rowID}
                    title={item.noticeTitle}
                    subtitle={Filter.datetimeFilter(item.creDate)}>
                  </ListItem>
                ):(
                  <ListItem onPress={()=>this.openDetailScreen(rowID)} key={rowID}
                    title={item.noticeTitle}
                    rightIcon={{name:'weiduxiaoxitishidian-copy',type:'iconfont',color:'#DA4F49'}}
                    subtitle={Filter.datetimeFilter(item.creDate)}>
                  </ListItem>
                )

                }>
          </ListView>
        </List>
      </View>
    );
  }
}
