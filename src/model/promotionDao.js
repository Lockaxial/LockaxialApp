/**
*活动促销类广告
*/
import BaseDao from './baseDao';
import ajax from '../util/ajax';

export default class PromotionDao extends BaseDao {
  constructor() {
    super();
  }

  /**
  *获取更多联系物业列表
  */
  load(promotionId,cb){
    let _this=this;
    ajax.get('/shop/retrievePromotion',{promotionId:promotionId},function(result){
      if (result.code == 0&&result.data) {
        if(result.data.images&&result.data.images.length>0){
          result.data.images=JSON.parse(result.data.images);
        }else{
          result.data.images=[];
        }
        for(let j=0;j<result.data.images.length;j++){
          result.data.images[j]=ajax.convertImageUrl(result.data.images[j]);
        }
      }
      if(cb){cb(result);}
    });
  }
}
