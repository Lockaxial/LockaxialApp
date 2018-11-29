//
//  BleHandler.m
//  Intermobile
//
//  Created by 结点科技 on 2017/5/17.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "BleHandler.h"
#import "ReactBridge.h"
#import <CoreBluetooth/CoreBluetooth.h>
#import<CoreBluetooth/CBService.h>

static BleHandler *_INSTANCE=nil;

@interface BleHandler()
@property BOOL isReady;
@property NSString* deviceName;
@property NSString* username;
@property NSString* unitNo;
@property (nonatomic, strong) CBCentralManager *manager;
@property (nonatomic, strong) CBPeripheral *peripheral;

@property (strong,nonatomic) NSMutableDictionary *devices;
@end

@implementation BleHandler

- (BleHandler *)init
{
  self = [super init];
  if (self) {
    _INSTANCE=self;
  }
  [self initBleManager];
  return self;
}

-(void)initBleManager
{
  self.manager = [[CBCentralManager alloc] initWithDelegate:self queue:nil];
  _isReady = false;
  _devices = [[NSMutableDictionary alloc]init];
}

-(void)centralManagerDidUpdateState:(CBCentralManager *)central{
  if (central.state==CBCentralManagerStatePoweredOn)
  {
    _isReady=true;
    NSLog(@"蓝牙已就绪");
  }
  else
  {
    NSLog(@"蓝牙不可用");
  }
}

-(void)startBleScan //扫描蓝牙设备
{
  [_devices removeAllObjects];
  if (self.manager.state==CBCentralManagerStatePoweredOn) {
    [self.manager stopScan];
    [self.manager scanForPeripheralsWithServices:nil options:nil];
  }
}

-(void)stopBleScan
{
  [_devices removeAllObjects];
  [self stopBleScanDirectly];
}

-(void)stopBleScanDirectly
{
  if (self.manager.state==CBCentralManagerStatePoweredOn) {
    [self.manager stopScan];
  }
}

-(void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI
{
  NSLog(@"扫描连接外设：%@ %@",peripheral.name,RSSI);
  if ([peripheral.name hasPrefix:@"NPBLE-"]) {
    [_devices setObject:peripheral forKey:peripheral.name];
    [self onFindBleDevice:peripheral.name];
  }
}

-(void)openBleLock:(NSString *)deviceName username:(NSString *)username unitNo:(NSString *)unitNo //蓝牙开门
{
  [self stopBleScanDirectly];
  self.peripheral=[_devices objectForKey:[@"NPBLE-" stringByAppendingString:deviceName]];
  if(self.peripheral)
  {
    self.deviceName=deviceName;
    self.username=username;
    self.unitNo=unitNo;
    [self.manager stopScan];
    [self.manager connectPeripheral:self.peripheral options:nil];
  }
}

-(void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral
{
  [self.peripheral setDelegate:self];
  [self.peripheral discoverServices:nil];  //开始搜索服务；
}

- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(nullable NSError *)error
{
  [self onOpenBleLockFailed:1];
  NSLog(@"连接失败");
}


//扫描到服务
-(void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error{
  if(error)
  {
    [self onOpenBleLockFailed:2];
    return;
  }
  for (CBService *service in peripheral.services) {
    NSLog(@"find-->%@",service.UUID.UUIDString);
    if([service.UUID.UUIDString hasPrefix:@"FFE0"]){
      [peripheral discoverCharacteristics:nil forService:service];
      return;
    }
  }
  [self onOpenBleLockFailed:2];
}


//扫描到特征
-(void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error{
  if (error)
  {
    [self onOpenBleLockFailed:3];
    return;
  }
  for (CBCharacteristic *characteristic in service.characteristics)
  {
    [peripheral setNotifyValue:YES forCharacteristic:characteristic];
    NSLog(@"find-->%@",characteristic.UUID.UUIDString);
    if ([characteristic.UUID.UUIDString hasPrefix:@"FFE1"])
    {
      NSData* data=[self generateOpenLockData];
      [self sendMessage:data peripheral:peripheral forCharacteristic:characteristic];
      return;
    }
  }
  [self onOpenBleLockFailed:3];
}

-(void)sendMessage:(NSData *)data peripheral:(CBPeripheral *)peripheral forCharacteristic:(CBCharacteristic *)characteristic
{
  NSLog(@"开始写入数据");
  //只有 characteristic.properties 有write的权限才可以写
  if(characteristic.properties & CBCharacteristicPropertyWrite){
    [peripheral writeValue:data forCharacteristic:characteristic type:CBCharacteristicWriteWithoutResponse];
    [self performSelector:@selector(onOpenBleLockSuccess) withObject:nil afterDelay:0.2f];
    //[self onOpenBleLockSuccess];
  }else{
    NSLog(@"该字段不可写！");
    [self onOpenBleLockFailed:4];
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(nullable NSError *)error
{
  if(error){
    [self onOpenBleLockFailed:5];
  }else{
    [self onOpenBleLockSuccess];
  }
  
}

-(NSData*)encryptData:(NSData*)data
{
  Byte newData[6];
  Byte* p=[data bytes];
  newData[0]=(Byte)(p[0]+20);
  newData[1]=(Byte)(p[1]+17);
  newData[2]=(Byte)(p[2]+05);
  newData[3]=(Byte)(p[3]+18);
  newData[4]=(Byte)(p[4]+12);
  newData[5]=(Byte)(p[5]+01);
  NSData* result=[[NSData alloc] initWithBytes:newData length:6];
  return result;
}

-(NSData*)generateOpenLockData
{
  Byte data[]= {0xA1,0xFA,0x10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0x1A};
  Byte* dataPoint=data;
  NSData* deviceData=[self hexStringToBytes:self.deviceName];
  deviceData=[self encryptData:deviceData];
  [self copyData:deviceData to:dataPoint index:3 length:6];
  NSData * mobileData=[self hexStringToBytes:[@"0" stringByAppendingString:self.username]];
  [self copyData:mobileData to:dataPoint index:9 length:6];
  NSData * unitData=[self hexStringToBytes:self.unitNo];
  [self copyData:unitData to:dataPoint index:15 length:2];
  NSData* result = [[NSData alloc] initWithBytes:data length:20];
  NSString* str =  [[NSString alloc]initWithData:result encoding:NSUTF8StringEncoding];
  NSLog(@"数组-->%@",str);
  return result;
}

-(void)copyData:(NSData*)from to:(Byte*)to index:(int)index length:(int)length
{
  Byte* fromArray=(Byte *)[from bytes];
  for(int i=0;i<length;i++)
  {
    Byte p=fromArray[i];
    to[i+index]=p;
  }
}

-(NSData*)hexStringToBytes:(NSString*) hexString
{
    if (!hexString) {
        return nil;
    }
    hexString = [hexString uppercaseStringWithLocale:[NSLocale currentLocale]];
    int length = [hexString length] / 2;
    char *hexChars = [hexString cStringUsingEncoding:[NSString defaultCStringEncoding]];
    
    Byte d[length];
    for (int i = 0; i < length; i++) {
      int pos = i * 2;
      int p1=[self charToByte:hexChars[pos]];
      int p2=[self charToByte:hexChars[pos + 1]];
      int p=p1*16+p2;
      Byte p0=(Byte) 0xff&p;
      d[i]=p0;
    }
    NSData* result=[[NSData alloc] initWithBytes:d length:length];
    return result;
}

-(Byte)charToByte:(char)c
{
    Byte result=(Byte)-1;
    char charArray[16]={'0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'};
    for(int i=0;i<16;i++){
        if(charArray[i]==c){
            result=(Byte)i;
            break;
        }
    }
    return result;
}

-(void)onFindBleDevice:(NSString *) deviceName
{
  [ReactBridge sendMessage:@"findBleDevice" notification:@{@"deviceName":deviceName}];
}

-(void)onOpenBleLockFailed:(int) code
{
  [self stopBleScanDirectly];
  if(self.peripheral)
  {
    [self.manager cancelPeripheralConnection:self.peripheral];
    self.peripheral=nil;
  }
  [ReactBridge sendMessage:@"openBleLockFailed" notification:@{@"code":[NSNumber numberWithInt:(code)]}];
}

-(void)onOpenBleLockSuccess
{
  [self stopBleScanDirectly];
  if(self.peripheral)
  {
    [self.manager cancelPeripheralConnection:self.peripheral];
    self.peripheral=nil;
  }
  [ReactBridge sendMessage:@"openBleLockSuccess" notification:nil];
}


+(BleHandler *)getInstance
{
  if(!_INSTANCE)
  {
    _INSTANCE=[[BleHandler alloc]init];
  }
  return _INSTANCE;
}
@end

