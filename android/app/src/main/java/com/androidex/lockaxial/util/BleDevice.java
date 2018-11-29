/**
 * 用于蓝牙门禁控制
 */
package com.androidex.lockaxial.util;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.os.Handler;
import android.os.Message;

import java.util.List;

public abstract class BleDevice {
    public static final String SERVICE_UUID="0000FFE0";
    public static final String CHAR_UUID="0000FFE1";
    public static final String SERVICE2_UUID="FFE0";
    public static final String CHAR2_UUID="FFE1";

    private Handler handler=null;
    private Context context=null;
    private BluetoothDevice bluetoothDevice=null;
    private BluetoothGatt bluetoothGatt=null;
    private BluetoothGattCharacteristic bluetoothGattCharacteristic=null;

    private Thread checkThread=null;
    /**
     * 构造函数，BleDevice，需要传入Context
     */
    public BleDevice(Context context,Handler handler,BluetoothDevice bluetoothDevice){
        this.handler=handler;
        this.context=context;
        this.bluetoothDevice=bluetoothDevice;
    }

    public void openBleDevice(){
        bluetoothGatt = bluetoothDevice.connectGatt(context, false, gattCallback);
    }

    public void sendCommand(byte[] data){
        //将指令放置进特征中
        bluetoothGattCharacteristic.setValue(data);
        //设置回复形式
        bluetoothGattCharacteristic.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
        //开始写数据
        bluetoothGatt.writeCharacteristic(bluetoothGattCharacteristic);
    }

    private BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        //连接状态改变的回调
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status,
                                            int newState) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                // 连接成功后启动服务发现
                bluetoothGatt.discoverServices() ;
            }else{
                onMessageFailed(1);
            }
        };

        //发现服务的回调
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                List<BluetoothGattService> supportedGattServices =bluetoothGatt.getServices();
                for(int i=0;i<supportedGattServices.size();i++){
                    String serviceUuid=supportedGattServices.get(i).getUuid().toString().toUpperCase();
                    if(serviceUuid.startsWith(SERVICE_UUID)||serviceUuid.startsWith(SERVICE2_UUID)){
                        List<BluetoothGattCharacteristic> listGattCharacteristic=supportedGattServices.get(i).getCharacteristics();
                        for(int j=0;j<listGattCharacteristic.size();j++){
                            BluetoothGattCharacteristic thisChar=listGattCharacteristic.get(j);
                            String charUuid=thisChar.getUuid().toString().toUpperCase();
                            if(charUuid.startsWith(CHAR_UUID)||charUuid.startsWith(CHAR2_UUID)){
                                bluetoothGattCharacteristic=thisChar;
                                onConnected();
                                onSuccess();
                                startChecking();
                                return;
                            }
                        }
                    }
                }
                onMessageFailed(3);
            }else{
                //Log.e(TAG, "服务发现失败，错误码为:" + status);
                onMessageFailed(2);
            }
        };

        //写操作的回调
        public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
            }else{
                onMessageFailed(4);
            }
        };

        //读操作的回调
        public void onCharacteristicRead(BluetoothGatt gatt,BluetoothGattCharacteristic characteristic, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                byte[] data=characteristic.getValue();
                //onMessageSuccess(data);
            }
        }

        //数据返回的回调（此处接收BLE设备返回数据）
        public void onCharacteristicChanged(BluetoothGatt gatt,BluetoothGattCharacteristic characteristic) {
        };
    };

    public void startChecking(){
        checkThread=new Thread(){
            public void run(){
                try {
                    sleep(500); //等待新版本检查的时间
                    if(bluetoothGatt!=null){
                        close();
                    }
                }catch(InterruptedException e){
                }
                checkThread=null;
            }
        };
        checkThread.start();
    }

    protected void close(){
        if(bluetoothGatt!=null){
            bluetoothGatt.close();
            bluetoothGatt=null;
            bluetoothGattCharacteristic=null;
        }
    }

    private void onMessageFailed(int code){
        close();
        onFailed(code);
    }
    private void onMessageSuccess(){
        close();
        onSuccess();
    }

    protected void sendMessenge(int code,Object object){
        Message message = handler.obtainMessage();
        message.what =code;
        message.obj = object;
        handler.sendMessage(message);
    }

    protected abstract void onConnected();

    protected abstract void onFailed(int code);

    protected abstract void onSuccess();
}
