/**
*商品列表页面
*/
import React, { Component } from 'react';
import {
  Text,View,StyleSheet,ListView,TouchableOpacity
} from 'react-native';
import {Icon} from 'react-native-elements';

import SubListScreen from './subListScreen';
import GoodsPane from '../component/goodsPane';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toastX,toast} from '../util/tools';
import GoodsDao from '../model/goodsDao';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class GoodsMain extends SubListScreen {
  goodsDao=null;

  constructor(props) {
    super(props);
      this.state={
        shopId:this.props.shopId,
        list:ds.cloneWithRows([])
      }
      let _this=this;
      this.goodsDao=new GoodsDao(this.props.shopId);
      this.goodsDao.init(function(result){
        if(result){
          _this.changeList();
        }
      });
  }

  /**
  *更新论坛列表数据
  */
  changeList(){
    this.state.list=ds.cloneWithRows(this.goodsDao.list);
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
    this.goodsDao.load(function(result){
      _this.afterListRefresh(result.data.length);
      _this.changeList();
    });
  }

  render() {
    return(
      <View style={{marginBottom:45}}>
        <ListView
          enableEmptySections
          dataSource={this.state.list}
          onEndReached={()=>this.onPageRefresh()}
          onEndReachedThreshold={10}
          renderFooter={()=>this.renderRooter()}
          renderRow={(item, sectionID, rowID) =>
            <GoodsPane type="list" key={rowID} size={{width:3,height:2}}
               item={item} screen={this.props.screen}>
            </GoodsPane>
          }>
        </ListView>
      </View>
    );
  }
}
