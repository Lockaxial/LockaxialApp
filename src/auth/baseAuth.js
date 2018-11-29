/**
*所有Auth类的基类
*/
import ajax from '../util/ajax';
import sms from '../util/sms';

export default class BaseAuth{
  /**
  *登陆系统
  */
  login(username,password,deviceUuid,cb){
    ajax.post('/auth/login', {
      username:username,
      password:password,
      deviceUuid:deviceUuid
    },function (result) {
        if(cb){cb(result)};
    });
  }

  /**
  *注册用户
  */
  register(user,cb){
    ajax.post('/auth/userRegister', {
        user:user
    }, function (result) {
        if(cb){cb(result)};
    });
  }

  /**
  *注册用户
  */
  changePassword(userInfo,cb){
    ajax.post('/user/saveUser', {
      user: userInfo
    }, function (result) {
      if(cb){cb(result)};
    });
  }

  /**
   *注册用户
   */
  changeAccount(userInfo,cb){
    ajax.post('/user/changeAccount', {
      user: userInfo
    }, function (result) {
      if(cb){cb(result)};
    });
  }

  /**
  *保存用户信息
  */
  saveUserInfo(userInfo,cb){
    ajax.post('/user/save', {
      user: userInfo
    }, function (result) {
      if(cb){cb(result)};
    });
  }

  /**
  *检验验证码
  */
  verifySms(mobile,code,cb){
    sms.verifySms(mobile,code,cb);
  }

  /**
  *发送验证码
  */
  sendSms(mobile,cb){
    sms.sendSms(mobile,cb);
  }
}
