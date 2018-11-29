/**
 *个人中心子页面
 */
import React, { Component } from 'react';
import {
    ScrollView,View,Text,Image,Dimensions,TouchableWithoutFeedback,DeviceEventEmitter
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import SubScreen from './subScreen';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import MainStyle from '../style/mainStyle';
import accountDao from '../model/accountDao';

const LABEL_COUPON_INFO = 'coupon info';
const LABEL_MY_UNIT = 'UnitScreen';
const LABEL_MY_PHOTO = 'PhotoScreen';
const LABEL_CHANGE_PASSWORD = 'change password';
const LABEL_CHANGE_ACCOUNT = 'change account';
const LABEL_LOGOUT = 'logout';
const LABEL_ABOUT_US = 'about us';
const LABEL_HELP = 'help';
const LABEL_UNKNOW_USER = 'unknow user';
const LABEL_UNKNOW_MOBILE = 'unknow mobile';
const MSG_LOGOUT_CONFIRM = 'logout confirm';

const windowSize = Dimensions.get('window');

export default class ResidentMain extends SubScreen {
    constructor(props) {
        super(props);
        this.state = {
            userDetail: accountDao.userDetail
        }
    }

    /**
     *当此组件中显示完成后，注册一个changeUserAccount事件侦听，当用户信息产生变化时，更新显示
     */
    componentDidMount() {
        this.subscription = DeviceEventEmitter.addListener('changeUserAccount', (data)=>this.changeUserAccount(data)); //注册一个changeUserAccount消息，触发该消息时调用更新
        this.subscription = DeviceEventEmitter.addListener('changeUserDetail', (data)=>this.changeUserAccount(data)); //注册一个changeUserDetail消息，触发该消息时调用更新
    }

    /**
     *组件删除后，一并删除事件侦听
     */
    componentWillUnmount() {
        this.subscription.remove(); //页面销毁时注销消息事件
    }

    /**
     *当账户信息或者选择的房屋改变后，触发消息，进行刷新
     */
    changeUserAccount() {
        this.state = {
            userDetail: accountDao.userDetail
        }
        this.setState(this.state);
    }

    /**
     *打开登录页面
     */
    openLoginScreen() {
        this.openScreen('LoginScreen');
    }

    /**
     *打开用户信息编辑页面
     */
    openUserDetailScreen() {
        this.openScreenWithAuth('UserDetailScreen');
    }

    /**
     *打开优惠券
     */
    openCouponScreen() {
        this.openScreenWithAuth('CouponScreen');
    }

    /**
     *打开房屋列表页面，自己所有的房屋
     */
    openUnitScreen() {
        this.openScreenWithAuth('UnitScreen');
    }

    /**
     *打开房屋列表页面，自己所有的房屋
     */
    openDeviceScreen() {
        this.openScreenWithUnit('DeviceScreen', {
            type: 'P'
        });
    }

    /**
     *打开密码修改页面
     */
    openChangePasswordScreen() {
        this.openScreenWithAuth('ChangePasswordScreen');
    }

    /**
     *打开账户修改页面
     */
    openChangeAccountScreen() {
        this.openScreenWithAuth('ChangeAccountScreen');
    }

    /**
     *打开帮助页面
     */
    openHelpScreen() {
        this.openScreen('HelpScreen');
    }

    /**
     *打开关于我们页面
     */
    openAboutScreen() {
        this.openScreen('AboutScreen');
    }

    logout() {
        let _this = this;
        if (accountDao.userInfo.rid > 0) {
            this.openConfirmDialog(LABEL_LOGOUT, MSG_LOGOUT_CONFIRM, function () {
                accountDao.logout();
                _this.openLoginScreen();
            });
        } else {
            toastX(LABEL_UNKNOW_MOBILE);
        }
    }

    render() {
        return (
            <View style={MainStyle.subScreen}>
                <ScrollView>
                    <Image source={require('../image/bannerCenter.jpg')}
                           style={{width:windowSize.width,height:(windowSize.width*400/800)}}>
                        <TouchableWithoutFeedback onPress={()=>this.openUserDetailScreen()}>
                            <View style={{alignItems:'center'}}>
                                {
                                    (this.state.userDetail.headimgurl && this.state.userDetail.headimgurl.length > 0) ? (
                                        <Image style={{marginTop:36,borderRadius:35,width:70,height:70}}
                                               source={{uri:this.state.userDetail.headimgurl}}/>
                                    ) : (
                                        <Image style={{marginTop:36,borderRadius:35,width:70,height:70}}
                                               source={require('../image/default.png')}/>
                                    )
                                }
                                <Text
                                    style={{marginTop:10,color:'white',fontSize:15,backgroundColor: 'rgba(0,0,0,0)'}}>{this.state.userDetail.realname ? this.state.userDetail.realname : trans(LABEL_UNKNOW_USER)}</Text>
                                <Text
                                    style={{marginTop:5,color:'white',fontSize:15,backgroundColor: 'rgba(0,0,0,0)'}}>{this.state.userDetail.mobile ? this.state.userDetail.mobile : trans(LABEL_UNKNOW_MOBILE)}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </Image>
                    <List containerStyle={MainStyle.list}>
                        <ListItem title={trans(LABEL_COUPON_INFO)} leftIcon={{name:'youhuiquan',type:'iconfont'}}
                                  onPress={()=>this.openCouponScreen()}/>
                        <ListItem title={trans(LABEL_MY_UNIT)} leftIcon={{name:'icon-test',type:'iconfont'}}
                                  onPress={()=>this.openUnitScreen()}/>
                        <ListItem title={trans(LABEL_MY_PHOTO)} leftIcon={{name:'fangkexinxi',type:'iconfont'}}
                                  onPress={()=>this.openDeviceScreen()}/>
                        <ListItem title={trans(LABEL_CHANGE_PASSWORD)} leftIcon={{name:'xiugaimima',type:'iconfont'}}
                                  onPress={()=>this.openChangePasswordScreen()}/>
                        <ListItem title={trans(LABEL_CHANGE_ACCOUNT)} leftIcon={{name:'guanyuwomen',type:'iconfont'}}
                                  onPress={()=>this.openChangeAccountScreen()}/>
                        <ListItem title={trans(LABEL_HELP)} leftIcon={{name:'bangzhu',type:'iconfont'}}
                                  onPress={()=>this.openHelpScreen()}/>
                        <ListItem title={trans(LABEL_LOGOUT)} leftIcon={{name:'tuichu',type:'iconfont'}}
                                  onPress={()=>this.logout()}/>
                    </List>
                </ScrollView>
            </View>
        );
    }
}
