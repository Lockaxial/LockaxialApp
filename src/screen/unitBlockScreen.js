/**
*房屋申请-选择楼栋
*/
import React, { Component } from 'react';
import {
  View,Text,ListView
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import {toast} from '../util/tools';
import accountDao from '../model/accountDao';
import unitApplicationDao from '../model/unitApplicationDao';
import MainStyle from '../style/mainStyle';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源

export default class UnitBlockScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={list:ds.cloneWithRows(unitApplicationDao.blockList)};
  }

  /**
  *选择楼栋后，将楼栋数据传入Dao
  */
  changeBlock(index){
    unitApplicationDao.changeBlock(index);
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
                    <ListItem onPress={()=>this.changeBlock(rowID)} key={rowID}
                      title={(item.blockNo==item.blockName)?item.blockName:(item.blockNo+'-'+item.blockName)}
                      rightIcon={{name:(item.rid==unitApplicationDao.choosedData.blockId?'done':'navigate-next')}}>
                    </ListItem>
                }>
          </ListView>
        </List>
      </View>
    );
  }
}
