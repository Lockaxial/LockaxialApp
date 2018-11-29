/**
*已经支付账单
*/
import React, { Component } from 'react';
import {
  View,ListView,Text
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalListScreen from './normalListScreen';
import trans from '../i18/trans';
import {toastX,toast} from '../util/tools';
import Filter from '../util/filter';
import MainStyle from '../style/mainStyle';
import billDao from '../model/billDao';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源
const LABEL_YUAN='yuan';

export default class BillHistoryScreen extends NormalListScreen {

  constructor(props) {
    super(props);
    let _this=this;
    this.state={
      list:ds.cloneWithRows([])
    };
    billDao.initPaiedList(function(result){
      if(result){
        _this.changeList();
      }
    });
  }

  /**
  *更新列表数据
  */
  changeList(){
    this.state.list=ds.cloneWithRows(billDao.paiedList);
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
    billDao.loadPaiedList(function(result){
      _this.afterListRefresh(result.data.length);
      _this.changeList();
    });
  }

  /**
  *打开账单详情页
  */
  openBillDetailScreen(rowID){
    let billId=billDao.paiedList[rowID].rid;
    this.openScreen('BillDetailScreen',{
      billId:billId
    });
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
                    <ListItem onPress={()=>this.openBillDetailScreen(rowID)} key={rowID} hideChevron={true}
                      title={item.billDate}
                      rightTitle={Filter.moneyFilter(item.billTotal)+trans(LABEL_YUAN)}
                      >
                    </ListItem>
                }>
          </ListView>
        </List>
      </View>
    );
  }
}
