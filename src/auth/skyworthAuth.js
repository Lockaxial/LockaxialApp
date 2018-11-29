/**
*创维Auth类,继承于基础类
*/
import ajax from '../util/ajax';
import {toast,toastX} from '../util/tools';

export default class SkyworthAuth{
  login(username,password,deviceUuid,cb){
    ajax.post('/skyworth/login', {
      username:username,
      password:password,
      deviceUuid:deviceUuid
    },function (result) {
        if(cb){cb(result)};
    });
  }

  register(user,cb){
    ajax.post('/skyworth/userRegister', {
        user:user,
        verifyCode:user.code
    }, function (result) {
        if(cb){cb(result)};
    });
  }

  changePassword(userInfo,cb){
    ajax.post('/skyworth/changePassword', {
      old_password:userInfo.password1,
      new_password:userInfo.password
    }, function (result) {
      if(cb){cb(result)};
    });
  }

  verifySms(mobile,code,cb){
    ajax.post('/skyworth/verifyCode',{mobile:mobile,code:code},function(result){
      if(cb){cb(result.code)};
    });
  }

  sendSms(mobile,cb){
    ajax.post('/skyworth/sendSMS',{mobile:mobile},function(result){
      if(result.code==201001){
        toastX('mobile registered already');
      }
      if(cb){cb(result)};
    });
  }
}
