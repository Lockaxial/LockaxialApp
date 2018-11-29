/**
*页面基础类
*/
import React, { Component } from 'react';
import {
  Navigator
} from 'react-native';

import trans from '../i18/trans';
import {toast} from '../util/tools';
import accountDao from '../model/accountDao';

var LAST_SCREEN_NAME='';

export default class BaseScreen extends Component {
  constructor(props) {
    super(props);
  }

  /**
  *打开对话框
  */
  openDialog(name,props){
    if(!props){
      props=null;
    }
    let navigator=this.props.navigator;
    if(navigator){
      navigator.showModal({
        screen:name,
        passProps:props
      });
    }
  }

  /**
  *打开确认对话框
  */
  openConfirmDialog(title,content,cb){
    this.openDialog("ConfirmDialog",{options:{
      title:title,
      content:content,
      rightCallback:cb
    }});
  }

  /**
  *打开信息提示对话框
  */
  openInfoDialog(title,content,cb){
    this.openDialog("InfoDialog",{options:{
      title:title,
      content:content,
      leftCallback:cb
    }});
  }

  /**
  *打开信息输入对话框
  */
  openInputDialog(title,content,cb){
    this.openDialog("InputDialog",{options:{
      title:title,
      content:content,
      rightCallback:cb
    }});
  }

  /**
  *打开信息输入对话框
  */
  openInputScreen(title,content,cb){
    this.openScreen("InputScreen",{options:{
      title:title,
      content:content,
      rightCallback:cb
    }});
  }

  /**
  *打开页面，传入页面名称，名称为页面的类名
  */
  openScreen(name,props){
    if(!props){
      props=null;
    }
    let navigator=this.props.navigator;
    if(navigator){
      navigator.push({
        screen:name,
        title:trans(name),
        passProps:props
      });
    }
  }

  /**
  *打开页面，先检查是否已经登录，如果未登录则跳到登录页面
  */
  openScreenWithAuth(name,props){
    if(accountDao.userInfo.rid>0){
      this.openScreen(name,props);
    }else{
      this.openScreen('LoginScreen');
    }
  }

  /**
  *打开页面，先检查是否已经登录，如果未登录则跳到登录页面,再检查是否已经有选定的房屋，如果没有则跳到房屋选择页面
  */
  openScreenWithUnit(name,props){
    if(accountDao.userInfo.rid>0){
      if(accountDao.currentUnit){
        this.openScreen(name,props);
      }else{
        if(accountDao.unitList.length>0){
          this.openScreen('UnitSwitchScreen');
        }else{
          this.openScreen('UnitApplicationScreen');
        }
      }
    }else{
      this.openScreen('LoginScreen');
    }
  }

  /**
  *返回上一个页面
  */
  back(){
    let navigator=this.props.navigator;
    if(navigator){
      navigator.pop();
    }
  }
}
