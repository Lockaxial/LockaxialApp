/**
*访客通行
*/
import React, { Component } from 'react';
import {
  View,ListView,Text,Share
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalListScreen from './normalListScreen';
import trans from '../i18/trans';
import Filter from '../util/filter';
import {toastX,toast} from '../util/tools';
import MainStyle from '../style/mainStyle';
import visitorAccessDao from '../model/visitorAccessDao';
import accountDao from '../model/accountDao';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源
const VISITOR_ATTENTION='visitor attention';
const LABEL_CREATE='create';

export default class VisitorAccessScreen extends NormalListScreen {
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
      list:ds.cloneWithRows(visitorAccessDao.list)
    };
    visitorAccessDao.init(function(result){
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
        this.openVisitorCreateScreen();
      }
    }
  }

  /**
  *打开创建访客密码页面
  */
  openVisitorCreateScreen(){
    let _this=this;
    this.openScreen('VisitorCreateScreen',{
      afterCreated:function(newKey){
        _this.changeList();
      }
    });
  }

  /**
  *分享当前选中的密码
  */
  shareKey(rowID){
    let item=visitorAccessDao.list[rowID];
    let message="";
    if(item.enterTime>=0){
      message=trans('visitor password')+":"+item.tempkey+"("+trans('times limit')+item.enterTime+")";
    }else{
      message=trans('visitor password')+":"+item.tempkey+"("+trans('to')+item.endDate+")";
    }
    //this.ActionSheet.show();
    Share.share({
      message:message
    })
    .then(()=>{})
    .catch((error) =>{});
  }

  /**
  *更新列表数据
  */
  changeList(){
    this.state.list=ds.cloneWithRows(visitorAccessDao.list);
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
    visitorAccessDao.load(function(result){
      _this.afterListRefresh(result.data.length);
      _this.changeList();
    });
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <Text style={MainStyle.label}>{trans(VISITOR_ATTENTION)}</Text>
        <List containerStyle={[MainStyle.list,{marginBottom:40}]}>
          <ListView
            enableEmptySections
            dataSource={this.state.list}
            onEndReached={()=>this.onPageRefresh()}
            onEndReachedThreshold={10}
            renderFooter={()=>this.renderRooter()}
            renderRow={(item, sectionID, rowID) =>
                    <ListItem onPress={()=>this.shareKey(rowID)} key={rowID}
                      title={item.tempkey}
                      titleStyle={{fontSize:20}}
                      rightIcon={{name:'fenxiang',type:'iconfont'}}
                      subtitle={
                        <View style={MainStyle.subtitleView}>
                          {
                            item.enterTime>=0?(
                              <Text style={MainStyle.subtitleText}>{trans('can use')+item.enterTime+trans('times')}</Text>
                            ):(
                              <Text style={MainStyle.subtitleText}>{Filter.datetimeFilter(item.startDate)+trans('to')+Filter.datetimeFilter(item.endDate)}</Text>
                            )
                          }
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
