/**
 *账户数据类，主要用于登录、注册、修改密码、修改账户信息等
 *还包含当前账户的房屋信息、房屋切换等
 */
import {
    DeviceEventEmitter
} from 'react-native';
import JPushModule from 'jpush-react-native';

import BaseDao from './baseDao';
import ajax from '../util/ajax';
import storage from '../util/storage';
import noticeDao from './noticeDao';
import billDao from './billDao';
import reactBridge from '../bridge/reactBridge';
import appConf from '../comm/appConf';
import {auth} from '../comm/appConf';
import {generateUUID} from '../util/tools';
import {SYSTEM_USER_ACCOUNT,HTTP_SERVER_TOKEN,SYSTEM_USER_LIFT} from '../comm/cacheKey';

export class AccountDao extends BaseDao {
    account = {
        username: '',
        password: ''
    }; //登录账户，保留用户名及密码
    userInfo = { //返回的用户信息
        rid: 0,
        unitId: 0,
        communityId: 0
    };
    userDetail = { //登陆后用户的详细信息
        username: '',
        realname: '',
        headimgurl: '',
        mobile: ''
    };
    deviceUuid = "";

    privilege = null;
    unitList = []; //当前用户所有的房屋列表
    lockList = []; //当前用户所有门禁列表
    communityLockList = []; //当前用户在当前社区的所有门禁列表
    currentUnit = null;
    rtcStatus = 0;

    constructor() {
        super();
        // storage.storage.sync = {  //定义storage的同步方法，如果token值过期后，将自动调用该方法获取新的token
        //   token(params){
        //     //TODO
        //   }
        // }
        this.state = {
            tag: '',
            alias: '',
        }
        this.loadAccountFromLocal();

    }

    /**
     *发送账户信息到原生端
     */
    sendAccountToBridge() {
        reactBridge.sendMainMessage(10001, this.account.username);
    }

    /**
     *发送t退出信息到原生端
     */
    sendLogoutToBridge() {
        reactBridge.sendMainMessage(10002, null);
    }

    /**
     *从本地存储中获得用户及账号信息，并且调用获取最新的token方法
     */
    loadAccountFromLocal() {
        let _this = this;
        storage.load({
            key: SYSTEM_USER_ACCOUNT
        }).then(ret => {
            _this.account = ret.account;
            _this.userInfo = ret.userInfo;
            _this.userDetail = ret.userDetail;
            if (ret.deviceUuid) {
                _this.deviceUuid = ret.deviceUuid;
            } else {
                _this.deviceUuid = generateUUID();
            }
            if (_this.userInfo.rid > 0) { //发送账户信息到原生端
                _this.sendAccountToBridge();
            }
            _this.retrieveUnitCommunityInfo(ret.unitList, ret.lockList);
            if (_this.userInfo.rid > 0) {
                _this.loadTokenFromLocal();
            }
        }).catch(err => {
            console.log('NO Storage');
        });
    }

    /**
     *将账户及房屋门禁信息存储到本地
     */
    saveAccountToLocal() {
        storage.save({
            key: SYSTEM_USER_ACCOUNT,
            rawData: {
                account: this.account,
                userInfo: this.userInfo,
                userDetail: this.userDetail,
                deviceUuid: this.deviceUuid,
                unitList: this.unitList,
                lockList: this.lockList
            }
        });
    }

    /**
     * 电梯权限
     */
    saveLiftPrivilege() {
        storage.save({
            key: SYSTEM_USER_LIFT,
            rawData: this.privilege || ""
        });
    }

    /**
     *从本地获取token值，如果本地没有或者已经过期，则会自动到服务器获取最新token
     */
    loadTokenFromLocal() {
        let _this = this;
        storage.load({
            key: HTTP_SERVER_TOKEN
        }).then(ret => {
            ajax.token = ret.token;
            _this.relogin();
        }).catch(err => {
            console.log('NO Storage');
        });
    }

    /**
     * 获取电梯权限
     */
    loadLiftPrivilege(callback) {
        storage.load({
            key: SYSTEM_USER_LIFT
        }).then(ret => {
            callback(null, ret);
        }).catch(err => {
            callback(null, "");
        });
    }

    /**
     *重新登录
     */
    relogin() {
        this.login(this.account.username, this.account.password, function (result) {
        });
    }

    /**
     *当登陆成功后，即可对相应的业务数据进行初始化
     */
    initData() {
        this.initNoticeData();
        this.initBillData();
    }

    initNoticeData() {
        noticeDao.retrieveNoticeProfile(); //获取通知公告概要信息
    }

    initBillData() {
        billDao.retrieveBillProfile(); //获取账单概要信息
    }

    login(username, password, cb) {
        var _this = this;
        auth.login(username, password, _this.deviceUuid, function (result) {
            if (result.code == 0) {
                ajax.token = result.token;
                _this.account.username = username;
                _this.account.password = password;
                _this.userInfo.rid = result.user.rid;
                _this.userDetail.username = result.user.username;
                _this.userDetail.realname = result.user.realname;
                _this.userDetail.mobile = result.user.mobile;
                _this.userDetail.headimgurl = result.user.headimgurl;
                _this.privilege = result.privilege;
                _this.sendAccountToBridge();
                _this.retrieveUnitCommunityInfo(result.data, result.lockList);
                _this.saveAccountToLocal();
                _this.saveLiftPrivilege();
                storage.save({
                    key: HTTP_SERVER_TOKEN,
                    rawData: {
                        token: ajax.token
                    },
                    expires: 1000 * 60 * 60 * 24 * 30 //30天过期
                });
                DeviceEventEmitter.emit('changeUserAccount', null); //触发用户账号改变事件
                console.log("result :username=" + result.user.username + ",realname=" + result.user.realname);
                console.log("userDetail :username=" + _this.userDetail.username);
                //绑定推送信息
               // _this.pushBind();
                console.log("pushBind :username=" + _this.userDetail.username);
                _this.initData();
            }
            cb(result);
        });
        /**
         *根据用户名及密码登陆系统
         */
    }

    pushBind(cb) {
        this.setState({alias: this.userDetail.username});
        this.setState({tags: this.getCommunityTags(this.unitList)});
        console.log("alias: " + this.state.alias);
        //this.state.tags = this.getCommunityTags(this.unitList);
        console.log("tags: " + this.state.tags);
        if (this.state.alias !== undefined) {
            JPushModule.setAlias(this.state.alias, function () {
                if (this.state.tags !== undefined) {
                    JPushModule.setTags(this.state.tags, function () {
                        console.log("Set alias succeed");
                        cb(0);
                    }, function () {
                        cb(1);
                    });
                }
            }, function () {
                console.log("Set alias failed");
                cb(1);
            });
        } else {
            console.warn("alias is undefined ");
        }
    }

    pushBindExit(cb) {
       // this.setState({alias: this.userDetail.username});
        console.log("alias: " + this.state.alias);
        //this.state.tags = this.getCommunityTags(this.unitList);
        console.log("tags: " + this.state.tags);
        if (this.state.alias !== undefined) {
            JPushModule.setAlias(this.state.alias, function () {
                if (this.state.tags !== undefined) {
                    JPushModule.setTags(this.state.tags, function () {
                        console.log("Set alias succeed");
                        cb(0);
                    }, function () {
                        cb(1);
                    });
                }
            }, function () {
                console.log("Set alias failed");
                cb(1);
            });
        } else {
            console.warn("alias is undefined ");
        }
    }


    /**
     *绑定推送服务的别名
     */
    pushServiceBind(alias, tags, cb) {
        if (this.state.alias !== undefined) {
            JPushModule.setAlias(this.state.alias, () => {
                console.log("Set alias succeed");
                cb(0);
            }, function () {
                console.log("Set alias failed");
                cb(1);
            });
        }
        //if (this.state.alias !== undefined) {
        //    JPushModule.setAlias(this.state.alias, () => {
        //        console.log("Set alias succeed");
        //    }, () => {
        //        console.log("Set alias failed");
        //    });
        //}


    }

    /**
     *根据房屋获得推送列别
     */
    getCommunityTags(unitList) {
        var communityIds = [];

        function pushCommunityId(communityId) {
            var result = false;
            for (var i = 0; i < communityIds.length; i++) {
                if (communityIds[i] == "COMM_" + communityId) {
                    result = true;
                    break;
                }
            }
            if (!result) {
                communityIds.push("COMM_" + communityId);
            }
        }

        if (unitList && unitList.length > 0) {
            for (var i = 0; i < unitList.length; i++) {
                var communityId = unitList[i].communityId;
                pushCommunityId(communityId);
            }
        } else {
            communityIds.push("COMM_" + 0);
        }
        return communityIds;
    }

    /**
     *注册用户
     *result.code=1：手机号已经被注册
     */
    register(user, cb) {
        auth.register(user, cb);
    }

    /**
     *将房屋列表及门禁列表保存入本地数据，并且得到当前房屋及当前社区的门禁列表
     */
    retrieveUnitCommunityInfo(unitList, lockList) {
        this.unitList = unitList;
        this.lockList = lockList;

        //根据之前存储的房屋ID，获得当前的房屋信息，否则采用第一个房屋
        for (var i = 0; i < this.unitList.length; i++) {
            if (i == 0) {
                this.currentUnit = this.unitList[i];
            } else {
                if (this.unitList[i].rid == this.userInfo.unitId) {
                    this.currentUnit = this.unitList[i];
                }
            }
        }
        this.retrieveCommunityLockList();

        //当前的房屋，在用户信息中设置房屋ID及社区ID
        if (this.currentUnit && this.currentUnit.rid) {
            this.userInfo.unitId = this.currentUnit.rid;
            this.userInfo.communityId = this.currentUnit.communityId;
        } else {
            this.userInfo.unitId = 0;
            this.userInfo.communityId = 0;
        }
    }

    /**
     *获取当前社区的门禁列表
     */
    retrieveCommunityLockList() {
        this.communityLockList = [];
        for (var i = 0; i < this.lockList.length; i++) {
            if (this.currentUnit && this.currentUnit.rid) {
                if (this.currentUnit.communityId == this.lockList[i].communityId) {
                    this.communityLockList.push(this.lockList[i]);
                }
            }
        }
    }

    /**
     *根据当前的用户ID，从服务器获取最新的房屋列表及门禁列表
     */
    refreshApplicationData(cb) {
        var _this = this;
        if (this.userInfo.rid > 0) {
            ajax.get('/auth/refreshApplicationData', {
                userId: this.userInfo.rid
            }, function (result) {
                if (result.code == 0) {
                    _this.retrieveUnitCommunityInfo(result.data, result.lockList);
                    _this.saveAccountToLocal();
                    DeviceEventEmitter.emit('changeUserAccount', null); //触发用户账号改变事件
                    _this.initData(); //更新账户信息，更新本地通知、账单信息
                    //_this.pushBind();
                }
                if (cb) {
                    cb()
                }
            });
        } else {
            if (cb) {
                cb()
            }
        }
    }

    /**
     *保存用户信息，包括名称，头像等
     */
    saveUserInfo(userInfo, cb) {
        var _this = this;
        userInfo.rid = this.userInfo.rid;
        auth.saveUserInfo(userInfo, function (result) {
            if (result.code == 0) {
                _this.userDetail.realname = userInfo.realname;
                _this.userDetail.headimgurl = userInfo.headimgurl;
                _this.saveAccountToLocal();
                DeviceEventEmitter.emit('changeUserDetail', null); //触发用户账号改变事件
            }
            if (cb) {
                cb(result)
            }
            ;
        });
    }

    /**
     *修改当前用户的密码，result.code==1原密码错误
     */
    changePassword(oldPassword, newPassword, cb) {
        var _this = this;
        var userInfo = {
            rid: this.userInfo.rid,
            password: newPassword,
            password1: oldPassword
        };
        auth.changePassword(userInfo, function (result) {
            if (result.code == 0) {
                _this.account.password = newPassword;
                _this.saveAccountToLocal();
            }
            if (cb) {
                cb(result)
            }
        });
    }

    /**
     *修改当前用户的账户,result code=1: 当前账户正在使用
     */
    changeAccount(newAccount, cb) {
        var _this = this;
        var userInfo = {
            rid: this.userInfo.rid,
            username: newAccount
        };
        auth.changeAccount(userInfo, function (result) {
            if (cb) {
                cb(result)
            }
            ;
        });
    }

    /**
     *选择房屋
     */
    chooseUnit(index) {
        if (this.unitList[index].rid != this.userInfo.unitId) {
            this.currentUnit = this.unitList[index];
            this.userInfo.unitId = this.currentUnit.rid;
            this.userInfo.communityId = this.currentUnit.communityId;
            this.retrieveCommunityLockList();
            this.saveAccountToLocal();
            this.initData();
            DeviceEventEmitter.emit('changeUserAccount', null); //触发用户账号改变事件
            return true;
        } else {
            return false;
        }
    }

    /**
     *增加新房屋
     */
    addNewUnit(list) {
        if (list) {
            for (let i = 0; i < list.length; i++) {
                this.unitList.push(list[i]);
            }
            DeviceEventEmitter.emit('changeUserAccount', null); //触发用户账号改变事件
        }
    }

    /**
     *退出登录
     */
    logout() {
        this.account.username = '';
        this.account.password = '';
        this.userInfo = { //返回的用户信息
            rid: 0,
            unitId: 0,
            communityId: 0
        };

        this.userDetail = { //登陆后用户的详细信息
            username: '',
            realname: '',
            headimgurl: '',
            mobile: ''
        }
        this.unitList = []; //当前用户所有的房屋列表
        this.lockList = []; //当前用户所有门禁列表
        this.communityLockList = []; //当前用户在当前社区的所有门禁列表
        this.currentUnit = null;

        ajax.token = '';

        this.saveAccountToLocal();
        storage.save({
            key: HTTP_SERVER_TOKEN,
            rawData: {
                token: ajax.token
            },
            expires: 1000 * 60 * 60 * 24 * 30 //30天过期
        });
        DeviceEventEmitter.emit('changeUserAccount', null); //触发用户账号改变事件
        DeviceEventEmitter.emit('changeRtcStatus', {rtcStatus: 0}); //触发用户账号改变事件
        //this.subscription = DeviceEventEmitter.addListener('changeUserAccount',(data)=>this.changeUserAccount(data)); //注册一个changeUserAccount消息，触发该消息时调用更新
        noticeDao.clear();
        billDao.clear();
        this.sendLogoutToBridge();
        //绑定推送信息
       // this.pushBindExit();
    }
}

const accountDao = new AccountDao();
export default accountDao; //创建一个默认的数据对象，并将其导出
