package com.androidex.lockaxial.bean;

/**
 * Created by Administrator on 2018/5/16.
 */

public class CardBean {
    public String cardName;
    public String cardNumber;
    public String createDate;
    public CardBean(String cardName,String cardNumber,String createDate){
        this.cardName = cardName;
        this.cardNumber = cardNumber;
        this.createDate = createDate;
    }
}
