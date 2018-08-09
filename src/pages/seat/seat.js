import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

import './seat.scss'
export default class Seat extends Component {
  config ={
    enablePullDownRefresh:false
  }
  constructor(props){
    super(props);
    this.state = {
      seatData:[],
      statusMap:{
        can:"https://p1.meituan.net/movie/9dfff6fd525a7119d44e5734ab0e9fb41244.png",
        No:"https://p1.meituan.net/movie/bdb0531259ae1188b9398520f9692cbd1249.png",
        select:"https://p0.meituan.net/movie/585588bd86828ed54eed828dcb89bfdd1401.png"
      },
      active:'0',
      seatArray:[],
      buySeat:[]
    }

  }
  initParams(){
    const params = this.$router.params;
    const self = this;
    Taro.setNavigationBarTitle({
      title:params.cinemaName
    })
    Taro.showLoading({
      title:"加载中..."
    });
    Taro.request({
      url:`https://m.maoyan.com/ajax/seatingPlan?cityId=${params.cityId}&ci=${params.ci}&seqNo=${params.seqNo}`,
      method:'GET',
      header:{
        'Cookie': '_lxsdk_cuid=164b6cae2cac8-02b7b032f571b5-39614706-1fa400-164b6cae2cbc8; v=3; iuuid=1A6E888B4A4B29B16FBA1299108DBE9CA19FF6972813B39CA13A8D9705187374; ci=20%2C%E5%B9%BF%E5%B7%9E; selectci=; __mta=3463951.1532075108184.1533368636504.1533516565814.26; _lxsdk=1A6E888B4A4B29B16FBA1299108DBE9CA19FF6972813B39CA13A8D9705187374; __mta=3463951.1532075108184.1533516565814.1533629089523.27"; webp=true; uid=124265875; token=gcPnmyWgpw-Lw42L2Kyh8heCJRUAAAAAPAYAACytLQksSUCHw2tGR-dVok-gMM_PAJAddxxzMcwBMvafGuiBJ3PybndW14H1q_ueQw; from=canary; __mta=3463951.1532075108184.1533629096583.1533691360790.28; _lxsdk_s=1651720dbe9-cdd-1c3-614%7C%7C10; user=124265875%2CgcPnmyWgpw-Lw42L2Kyh8heCJRUAAAAAPAYAACytLQksSUCHw2tGR-dVok-gMM_PAJAddxxzMcwBMvafGuiBJ3PybndW14H1q_ueQw'
      }
    }).then(res=>{
      if(res.statusCode ==200){
        Taro.hideLoading();
        const seatData = res.data.seatData;
        const seatArray = [];
        seatData.seat.sections[0].seats.map(item=>{
          let  arr = [];
          item["columns"].map(seat=>{
            if(seat["st"] == "N"){
              arr.push('0');
            }else{
              arr.push('E')
            }
          })
          seatArray.push(arr);
        })
        self.setState({
          seatData:seatData,
          seatArray:seatArray
        });
      }
    })
  }
  selectSeat(row,column,item){
    const self = this;
    const arr = this.state.seatArray;
    if(item == 0){
      arr[row][column]= '2';
      if(self.state.buySeat.length == 4){
        Taro.showToast({
          title: '最多只能选择4个座位',
          duration: 2000
        })
        return false;
      }else{
        self.setState({
          buySeat:self.state.buySeat.concat({
            "row":row+1,
            "column":column
          })
        })
      }
    }else{
      arr[row][column]= '0';
      let  buySeat = self.state.buySeat;
      self.setState({
        buySeat:buySeat.splice(-1,1)
      })
    }
    self.setState({
      seatArray:arr
    });
  }
  componentDidMount () {
    this.initParams();
  }
  render () {
    const show = this.state.seatData.show;
    const hall = this.state.seatData.hall;
    const movie = this.state.seatData.movie;
    const seatInfo = this.state.seatData.seat?this.state.seatData.seat.sections[0]:[];
    const seatTypeList = this.state.seatData.seat?this.state.seatData.seat.seatTypeList:[];
    const seatMap = this.state.statusMap;
    const seatArray = this.state.seatArray;
    return (
      <View className="selectSeat">
        <View className="header">
          <View className="title">{movie.movieName}</View>
          <View className="desc">
            <Text className="time">{show.showDate} {show.showTime}</Text>
            <Text classname="lang"><Text className="language">{show.lang}</Text><Text className="dim">{show.dim}</Text></Text>
          </View>
        </View>
        <View className="seatCon">
          <View className="hallCon">
            <View className="hallName">{hall.hallName}</View>
          </View>
          <View className="seatMore">
            <View className="rowList">
              {
                seatInfo.seats.map((item,index)=>{
                  return (
                    <View className="numberId" key={key}>{index+1}</View>
                  )
                })
              }
            </View>
            <View className="Container">
              {
                Object.keys(seatArray).map(key=>{
                  return (
                    <View className="rowWrap" key={key}>
                      {
                        seatArray[key].map((item,index)=>{
                          return (
                            <View className="seatWrap" key={index}>
                              {item == '0'?<Image src={seatMap.can} onClick={this.selectSeat.bind(this,key,index,item)}></Image>:(item == '2'?<Image src={seatMap.select}  onClick={this.selectSeat.bind(this,key,index,item)}></Image>:<Text></Text>)}
                            </View>
                          )
                        })
                      }
                    </View>
                  )
                })
              }
            </View>
            </View>
        </View>
        <View className="type">
          {
            seatTypeList.map((item,index)=>{
              return (
                <View className="item" key={index}>
                  <Image src={item.icon}></Image>
                  <Text className="word">{item.name}</Text>
                </View>
              )
            })
          }
        </View>
        <View className="comment">
          <View className="title">推荐</View>
          <View className="btn">
            <View className="btnItem">1人</View>
            <View className="btnItem">2人</View>
            <View className="btnItem">3人</View>
            <View className="btnItem">4人</View>
            <View className="btnItem">5人</View>
          </View>
        </View>
        <View className="buyBtn">请先选座</View>
      </View>
    );
  }
}
