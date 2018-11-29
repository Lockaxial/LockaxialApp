/**
*访客通行
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
import adviceDao from '../model/adviceDao';
import accountDao from '../model/accountDao';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源
const LABEL_CREATE='create';

export default class AdviceScreen extends NormalListScreen {
  static navigatorButtons = {
    rightButtons: [
      {
        title: trans(LABEL_CREATE), // for a textual button, provide the button title (label)
        id: LABEL_CREATE // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
      }
    ]
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    let _this=this;
    this.state={
      list:ds.cloneWithRows(adviceDao.list)
    };
    adviceDao.init(function(result){
      if(result){
        _this.changeList();
      }
    });
  }

  /**
  *处理顶部导航条中的按钮事件
  */
  onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
    if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id == LABEL_CREATE) { // this is the same id field from the static navigatorButtons definition
        this.openAdviceCreateScreen();
      }
    }
  }

  /**
  *打开创建投诉建议页面
  */
  openAdviceCreateScreen(){
    let _this=this;
    this.openScreen('AdviceCreateScreen',{
      afterCreated:function(){
        _this.changeList();
      }
    });
  }

  /**
  *更新列表数据
  */
  changeList(){
    this.state.list=ds.cloneWithRows(adviceDao.list);
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
    adviceDao.load(function(result){
      _this.afterListRefresh(result.data.length);
      _this.changeList();
    });
  }

  /**
  *打开投诉建议详情页
  */
  openAdviceDetailScreen(rowID){
    this.openScreen('AdviceDetailScreen',{
      itemIndex:rowID
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
                    <ListItem onPress={()=>this.openAdviceDetailScreen(rowID)} key={rowID} hideChevron={true}
                      title={item.realname}
                      rightTitle={Filter.adviceFilter(item.state)}
                      subtitle={
                        <View style={MainStyle.subtitleView}>
                          <Text style={MainStyle.subtitleText}>{Filter.datetimeFilter(item.creDate)}</Text>
                          <Text style={MainStyle.subtitleText}>{item.adviceTitle}</Text>
                        </View>
                      }
                      >
                    </ListItem>
                }>
          </ListView>
        </List>
      </View>
    );
  }
}
