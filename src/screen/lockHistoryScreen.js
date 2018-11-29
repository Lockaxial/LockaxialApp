/**
*开门禁历史记录
*/
import React, { Component } from 'react';
import {
  View,ListView,Text
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalListScreen from './normalListScreen';
import trans from '../i18/trans';
import {toastX} from '../util/tools';
import MainStyle from '../style/mainStyle';
import LockHistoryDao from '../model/lockHistoryDao';
import Filter from '../util/filter';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源
const MSG_NO_ACCESS_IMAGE='no access image';

export default class LockHistoryScreen extends NormalListScreen {

  lockHistoryDao=new LockHistoryDao();

  constructor(props) {
    super(props);
    let _this=this;
    this.state={
      list:ds.cloneWithRows(this.lockHistoryDao.list)
    };
    this.lockHistoryDao.init(function(result){
      if(result){
        _this.changeList();
      }
    });
  }

  /**
  *更新列表数据
  */
  changeList(){
    this.state.list=ds.cloneWithRows(this.lockHistoryDao.list);
    this.setState(this.state);
  }

  /**
  *相应列表更新后的事件
  */
  onPageRefresh(){
    if(this.beforeListRefresh()){
      return;
    }
    var _this=this;
    this.lockHistoryDao.load(function(result){
      _this.afterListRefresh(result.data.length);
      _this.changeList();
    });
  }

  /**
  *打开历史纪录的明细，访客图片预览
  */
  openHistoryDetail(rowID){
    let item=this.lockHistoryDao.list[rowID];
    if(item.imageUrl){
      this.openScreen('ImageGallery',{
        images:[item.imageUrl],
        initialPage:0
      })
    }else{
      toastX(MSG_NO_ACCESS_IMAGE);
    }
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
                    <ListItem key={rowID}
                      title={item.lockName}
                      onPress={()=>this.openHistoryDetail(rowID)}
                      avatar={item.imageUrl?{uri:item.imageUrl}:(require('../image/default.png'))}
                      subtitle={Filter.datetimeFilter(item.creDate)}
                      rightTitle={Filter.openTyleFilter(item.type)}>
                    </ListItem>
                }>
          </ListView>
        </List>
      </View>
    );
  }
}
