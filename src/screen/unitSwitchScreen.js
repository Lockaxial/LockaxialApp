/**
*房屋选择及切换
*/
import React, { Component } from 'react';
import {
  View,ListView,DeviceEventEmitter
} from 'react-native';
import {List,ListItem,Button} from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import {toastX} from '../util/tools';
import accountDao from '../model/accountDao';
import MainStyle from '../style/mainStyle';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源
const SWITCH_UNIT_SUCCESS='switch unit success';
const APPLICATION='application';

export default class UnitSwitchScreen extends NormalScreen {
  static navigatorButtons = {
    rightButtons: [
      {
        title: trans(APPLICATION), // for a textual button, provide the button title (label)
        id: APPLICATION // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
      }
    ]
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.state={
      list:ds.cloneWithRows(accountDao.unitList)
    };
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
    this.state={
      list:ds.cloneWithRows(accountDao.unitList)
    };
    this.setState(this.state);
  }

  /**
  *处理顶部导航条中的按钮事件
  */
  onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
    if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id == APPLICATION) { // this is the same id field from the static navigatorButtons definition
        this.openUnitApplicationScreen();
      }
    }
  }

  /**
  *打开房屋申请页面
  */
  openUnitApplicationScreen(){
    this.openScreen('UnitApplicationScreen');
  }

  /**
  *切换选择的房屋，rowID为选择的房屋列表的序号
  */
  chooseUnit(rowID){
    if(accountDao.chooseUnit(rowID)){
      this.state.list=ds.cloneWithRows(accountDao.unitList);
      this.setState(this.state);
      toastX(SWITCH_UNIT_SUCCESS);
    }
    this.back();
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <List containerStyle={MainStyle.list}>
          <ListView
            enableEmptySections
            dataSource={this.state.list}
            renderRow={(item, sectionID, rowID) =>
                    <ListItem onPress={()=>this.chooseUnit(rowID)} key={rowID}
                      title={item.unitName}
                      rightIcon={{name:(item.rid==accountDao.userInfo.unitId?'vpn-key':'navigate-next')}}>
                    </ListItem>
                }>
          </ListView>
        </List>
      </View>
    );
  }
}
