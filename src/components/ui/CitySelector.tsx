'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search } from 'lucide-react'

// 城市数据类型
interface City {
  name: string
  code: string
  province?: string
  city?: string
  districts?: District[]
  isDistrict?: boolean
}

interface District {
  name: string
  code: string
}

interface Province {
  name: string
  code: string
  cities: City[]
}

// 热门城市
const HOT_CITIES: City[] = [
  { name: '北京', code: 'beijing' },
  { name: '上海', code: 'shanghai' },
  { name: '广州', code: 'guangzhou' },
  { name: '深圳', code: 'shenzhen' },
  { name: '杭州', code: 'hangzhou' },
  { name: '南京', code: 'nanjing' },
  { name: '武汉', code: 'wuhan' },
  { name: '成都', code: 'chengdu' },
  { name: '西安', code: 'xian' },
  { name: '重庆', code: 'chongqing' },
  { name: '天津', code: 'tianjin' },
  { name: '苏州', code: 'suzhou' }
]

// 省份和城市数据
const PROVINCES_DATA: Province[] = [
  {
    name: '北京',
    code: 'beijing',
    cities: [
      { name: '全北京', code: 'beijing-all' },
      { name: '东城区', code: 'dongcheng' },
      { name: '西城区', code: 'xicheng' },
      { name: '朝阳区', code: 'chaoyang' },
      { name: '丰台区', code: 'fengtai' },
      { name: '石景山区', code: 'shijingshan' },
      { name: '海淀区', code: 'haidian' },
      { name: '门头沟区', code: 'mentougou' },
      { name: '房山区', code: 'fangshan' },
      { name: '通州区', code: 'tongzhou' },
      { name: '顺义区', code: 'shunyi' },
      { name: '昌平区', code: 'changping' },
      { name: '大兴区', code: 'daxing' },
      { name: '怀柔区', code: 'huairou' },
      { name: '平谷区', code: 'pinggu' },
      { name: '密云区', code: 'miyun' },
      { name: '延庆区', code: 'yanqing' }
    ]
  },
  {
    name: '上海',
    code: 'shanghai',
    cities: [
      { name: '全上海', code: 'shanghai-all' },
      { name: '黄浦区', code: 'huangpu' },
      { name: '徐汇区', code: 'xuhui' },
      { name: '长宁区', code: 'changning' },
      { name: '静安区', code: 'jingan' },
      { name: '普陀区', code: 'putuo' },
      { name: '虹口区', code: 'hongkou' },
      { name: '杨浦区', code: 'yangpu' },
      { name: '闵行区', code: 'minhang' },
      { name: '宝山区', code: 'baoshan' },
      { name: '嘉定区', code: 'jiading' },
      { name: '浦东新区', code: 'pudong' },
      { name: '金山区', code: 'jinshan' },
      { name: '松江区', code: 'songjiang' },
      { name: '青浦区', code: 'qingpu' },
      { name: '奉贤区', code: 'fengxian' },
      { name: '崇明区', code: 'chongming' }
    ]
  },
  {
    name: '天津',
    code: 'tianjin',
    cities: [
      { name: '全天津', code: 'tianjin-all' },
      { name: '和平区', code: 'heping' },
      { name: '河东区', code: 'hedong' },
      { name: '河西区', code: 'hexi' },
      { name: '南开区', code: 'nankai' },
      { name: '河北区', code: 'hebei' },
      { name: '红桥区', code: 'hongqiao' },
      { name: '东丽区', code: 'dongli' },
      { name: '西青区', code: 'xiqing' },
      { name: '津南区', code: 'jinnan' },
      { name: '北辰区', code: 'beichen' },
      { name: '武清区', code: 'wuqing' },
      { name: '宝坻区', code: 'baodi' },
      { name: '滨海新区', code: 'binhai' },
      { name: '宁河区', code: 'ninghe' },
      { name: '静海区', code: 'jinghai' },
      { name: '蓟州区', code: 'jizhou' }
    ]
  },
  {
    name: '重庆',
    code: 'chongqing',
    cities: [
      { name: '全重庆', code: 'chongqing-all' },
      { name: '万州区', code: 'wanzhou' },
      { name: '涪陵区', code: 'fuling' },
      { name: '渝中区', code: 'yuzhong' },
      { name: '大渡口区', code: 'dadukou' },
      { name: '江北区', code: 'jiangbei' },
      { name: '沙坪坝区', code: 'shapingba' },
      { name: '九龙坡区', code: 'jiulongpo' },
      { name: '南岸区', code: 'nanan' },
      { name: '北碚区', code: 'beibei' },
      { name: '綦江区', code: 'qijiang' },
      { name: '大足区', code: 'dazu' },
      { name: '渝北区', code: 'yubei' },
      { name: '巴南区', code: 'banan' },
      { name: '黔江区', code: 'qianjiang' },
      { name: '长寿区', code: 'changshou' },
      { name: '江津区', code: 'jiangjin' },
      { name: '合川区', code: 'hechuan' },
      { name: '永川区', code: 'yongchuan' },
      { name: '南川区', code: 'nanchuan' }
    ]
  },
  {
    name: '河北',
    code: 'hebei',
    cities: [
      { name: '石家庄', code: 'shijiazhuang' },
      { name: '保定', code: 'baoding' },
      { name: '张家口', code: 'zhangjiakou' },
      { name: '承德', code: 'chengde' },
      { name: '沧州', code: 'cangzhou' },
      { name: '廊坊', code: 'langfang' },
      { name: '衡水', code: 'hengshui' },
      { name: '秦皇岛', code: 'qinhuangdao' },
      { name: '邯郸', code: 'handan' },
      { name: '邢台', code: 'xingtai' },
      { name: '唐山', code: 'tangshan' }
    ]
  },
  {
    name: '山西',
    code: 'shanxi',
    cities: [
      { name: '太原', code: 'taiyuan' },
      { name: '大同', code: 'datong' },
      { name: '阳泉', code: 'yangquan' },
      { name: '长治', code: 'changzhi' },
      { name: '晋城', code: 'jincheng' },
      { name: '朔州', code: 'shuozhou' },
      { name: '晋中', code: 'jinzhong' },
      { name: '运城', code: 'yuncheng' },
      { name: '忻州', code: 'xinzhou' },
      { name: '临汾', code: 'linfen' },
      { name: '吕梁', code: 'lvliang' }
    ]
  },
  {
    name: '辽宁',
    code: 'liaoning',
    cities: [
      { name: '沈阳', code: 'shenyang' },
      { name: '大连', code: 'dalian' },
      { name: '鞍山', code: 'anshan' },
      { name: '抚顺', code: 'fushun' },
      { name: '本溪', code: 'benxi' },
      { name: '丹东', code: 'dandong' },
      { name: '锦州', code: 'jinzhou' },
      { name: '营口', code: 'yingkou' },
      { name: '阜新', code: 'fuxin' },
      { name: '辽阳', code: 'liaoyang' },
      { name: '盘锦', code: 'panjin' },
      { name: '铁岭', code: 'tieling' },
      { name: '朝阳', code: 'chaoyang-ln' },
      { name: '葫芦岛', code: 'huludao' }
    ]
  },
  {
    name: '吉林',
    code: 'jilin',
    cities: [
      { name: '长春', code: 'changchun' },
      { name: '吉林', code: 'jilin-city' },
      { name: '四平', code: 'siping' },
      { name: '辽源', code: 'liaoyuan' },
      { name: '通化', code: 'tonghua' },
      { name: '白山', code: 'baishan' },
      { name: '松原', code: 'songyuan' },
      { name: '白城', code: 'baicheng' },
      { name: '延边', code: 'yanbian' }
    ]
  },
  {
    name: '黑龙江',
    code: 'heilongjiang',
    cities: [
      { name: '哈尔滨', code: 'harbin' },
      { name: '齐齐哈尔', code: 'qiqihar' },
      { name: '鸡西', code: 'jixi' },
      { name: '鹤岗', code: 'hegang' },
      { name: '双鸭山', code: 'shuangyashan' },
      { name: '大庆', code: 'daqing' },
      { name: '伊春', code: 'yichun-hlj' },
      { name: '佳木斯', code: 'jiamusi' },
      { name: '七台河', code: 'qitaihe' },
      { name: '牡丹江', code: 'mudanjiang' },
      { name: '黑河', code: 'heihe' },
      { name: '绥化', code: 'suihua' },
      { name: '大兴安岭', code: 'daxinganling' }
    ]
  },
  {
    name: '江苏',
    code: 'jiangsu',
    cities: [
      { name: '南京', code: 'nanjing' },
      { name: '无锡', code: 'wuxi' },
      { name: '徐州', code: 'xuzhou' },
      { name: '常州', code: 'changzhou' },
      { name: '苏州', code: 'suzhou' },
      { name: '南通', code: 'nantong' },
      { name: '连云港', code: 'lianyungang' },
      { name: '淮安', code: 'huaian' },
      { name: '盐城', code: 'yancheng' },
      { name: '扬州', code: 'yangzhou' },
      { name: '镇江', code: 'zhenjiang' },
      { name: '泰州', code: 'taizhou-js' },
      { name: '宿迁', code: 'suqian' }
    ]
  },
  {
    name: '浙江',
    code: 'zhejiang',
    cities: [
      { name: '杭州', code: 'hangzhou' },
      { name: '宁波', code: 'ningbo' },
      { name: '温州', code: 'wenzhou' },
      { name: '嘉兴', code: 'jiaxing' },
      { name: '湖州', code: 'huzhou' },
      { name: '绍兴', code: 'shaoxing' },
      { name: '金华', code: 'jinhua' },
      { name: '衢州', code: 'quzhou' },
      { name: '舟山', code: 'zhoushan' },
      { name: '台州', code: 'taizhou-zj' },
      { name: '丽水', code: 'lishui' }
    ]
  },
  {
    name: '安徽',
    code: 'anhui',
    cities: [
      { name: '合肥', code: 'hefei' },
      { name: '芜湖', code: 'wuhu' },
      { name: '蚌埠', code: 'bengbu' },
      { name: '淮南', code: 'huainan' },
      { name: '马鞍山', code: 'maanshan' },
      { name: '淮北', code: 'huaibei' },
      { name: '铜陵', code: 'tongling' },
      { name: '安庆', code: 'anqing' },
      { name: '黄山', code: 'huangshan' },
      { name: '滁州', code: 'chuzhou' },
      { name: '阜阳', code: 'fuyang' },
      { name: '宿州', code: 'suzhou-ah' },
      { name: '六安', code: 'luan' },
      { name: '亳州', code: 'bozhou' },
      { name: '池州', code: 'chizhou' },
      { name: '宣城', code: 'xuancheng' }
    ]
  },
  {
    name: '福建',
    code: 'fujian',
    cities: [
      { name: '福州', code: 'fuzhou' },
      { name: '厦门', code: 'xiamen' },
      { name: '莆田', code: 'putian' },
      { name: '三明', code: 'sanming' },
      { name: '泉州', code: 'quanzhou' },
      { name: '漳州', code: 'zhangzhou' },
      { name: '南平', code: 'nanping' },
      { name: '龙岩', code: 'longyan' },
      { name: '宁德', code: 'ningde' }
    ]
  },
  {
    name: '江西',
    code: 'jiangxi',
    cities: [
      { name: '南昌', code: 'nanchang' },
      { name: '景德镇', code: 'jingdezhen' },
      { name: '萍乡', code: 'pingxiang' },
      { name: '九江', code: 'jiujiang' },
      { name: '新余', code: 'xinyu' },
      { name: '鹰潭', code: 'yingtan' },
      { name: '赣州', code: 'ganzhou' },
      { name: '吉安', code: 'jian' },
      { name: '宜春', code: 'yichun-jx' },
      { name: '抚州', code: 'fuzhou-jx' },
      { name: '上饶', code: 'shangrao' }
    ]
  },
  {
    name: '山东',
    code: 'shandong',
    cities: [
      { name: '济南', code: 'jinan' },
      { name: '青岛', code: 'qingdao' },
      { name: '淄博', code: 'zibo' },
      { name: '枣庄', code: 'zaozhuang' },
      { name: '东营', code: 'dongying' },
      { name: '烟台', code: 'yantai' },
      { name: '潍坊', code: 'weifang' },
      { name: '济宁', code: 'jining' },
      { name: '泰安', code: 'taian' },
      { name: '威海', code: 'weihai' },
      { name: '日照', code: 'rizhao' },
      { name: '临沂', code: 'linyi' },
      { name: '德州', code: 'dezhou' },
      { name: '聊城', code: 'liaocheng' },
      { name: '滨州', code: 'binzhou' },
      { name: '菏泽', code: 'heze' }
    ]
  },
  {
    name: '河南',
    code: 'henan',
    cities: [
      { name: '郑州', code: 'zhengzhou' },
      { name: '开封', code: 'kaifeng' },
      { name: '洛阳', code: 'luoyang' },
      { name: '平顶山', code: 'pingdingshan' },
      { name: '安阳', code: 'anyang' },
      { name: '鹤壁', code: 'hebi' },
      { name: '新乡', code: 'xinxiang' },
      { name: '焦作', code: 'jiaozuo' },
      { name: '濮阳', code: 'puyang' },
      { name: '许昌', code: 'xuchang' },
      { name: '漯河', code: 'luohe' },
      { name: '三门峡', code: 'sanmenxia' },
      { name: '南阳', code: 'nanyang' },
      { name: '商丘', code: 'shangqiu' },
      { name: '信阳', code: 'xinyang' },
      { name: '周口', code: 'zhoukou' },
      { name: '驻马店', code: 'zhumadian' },
      { name: '济源', code: 'jiyuan' }
    ]
  },
  {
    name: '湖北',
    code: 'hubei',
    cities: [
      { name: '武汉', code: 'wuhan' },
      { name: '黄石', code: 'huangshi' },
      { name: '十堰', code: 'shiyan' },
      { name: '宜昌', code: 'yichang' },
      { name: '襄阳', code: 'xiangyang' },
      { name: '鄂州', code: 'ezhou' },
      { name: '荆门', code: 'jingmen' },
      { name: '孝感', code: 'xiaogan' },
      { name: '荆州', code: 'jingzhou' },
      { name: '黄冈', code: 'huanggang' },
      { name: '咸宁', code: 'xianning' },
      { name: '随州', code: 'suizhou' },
      { name: '恩施', code: 'enshi' }
    ]
  },
  {
    name: '湖南',
    code: 'hunan',
    cities: [
      { name: '长沙', code: 'changsha' },
      { name: '株洲', code: 'zhuzhou' },
      { name: '湘潭', code: 'xiangtan' },
      { name: '衡阳', code: 'hengyang' },
      { name: '邵阳', code: 'shaoyang' },
      { name: '岳阳', code: 'yueyang' },
      { name: '常德', code: 'changde' },
      { name: '张家界', code: 'zhangjiajie' },
      { name: '益阳', code: 'yiyang' },
      { name: '郴州', code: 'chenzhou' },
      { name: '永州', code: 'yongzhou' },
      { name: '怀化', code: 'huaihua' },
      { name: '娄底', code: 'loudi' },
      { name: '湘西', code: 'xiangxi' }
    ]
  },
  {
    name: '广东',
    code: 'guangdong',
    cities: [
      { name: '广州', code: 'guangzhou' },
      { name: '韶关', code: 'shaoguan' },
      { name: '深圳', code: 'shenzhen' },
      { name: '珠海', code: 'zhuhai' },
      { name: '汕头', code: 'shantou' },
      { name: '佛山', code: 'foshan' },
      { name: '江门', code: 'jiangmen' },
      { name: '湛江', code: 'zhanjiang' },
      { name: '茂名', code: 'maoming' },
      { name: '肇庆', code: 'zhaoqing' },
      { name: '惠州', code: 'huizhou' },
      { name: '梅州', code: 'meizhou' },
      { name: '汕尾', code: 'shanwei' },
      { name: '河源', code: 'heyuan' },
      { name: '阳江', code: 'yangjiang' },
      { name: '清远', code: 'qingyuan' },
      { name: '东莞', code: 'dongguan' },
      { name: '中山', code: 'zhongshan' },
      { name: '潮州', code: 'chaozhou' },
      { name: '揭阳', code: 'jieyang' },
      { name: '云浮', code: 'yunfu' }
    ]
  },
  {
    name: '广西',
    code: 'guangxi',
    cities: [
      { name: '南宁', code: 'nanning' },
      { name: '柳州', code: 'liuzhou' },
      { name: '桂林', code: 'guilin' },
      { name: '梧州', code: 'wuzhou' },
      { name: '北海', code: 'beihai' },
      { name: '防城港', code: 'fangchenggang' },
      { name: '钦州', code: 'qinzhou' },
      { name: '贵港', code: 'guigang' },
      { name: '玉林', code: 'yulin-gx' },
      { name: '百色', code: 'baise' },
      { name: '贺州', code: 'hezhou' },
      { name: '河池', code: 'hechi' },
      { name: '来宾', code: 'laibin' },
      { name: '崇左', code: 'chongzuo' }
    ]
  },
  {
    name: '海南',
    code: 'hainan',
    cities: [
      { name: '海口', code: 'haikou' },
      { name: '三亚', code: 'sanya' },
      { name: '三沙', code: 'sansha' },
      { name: '儋州', code: 'danzhou' }
    ]
  },
  {
    name: '四川',
    code: 'sichuan',
    cities: [
      { name: '成都', code: 'chengdu' },
      { name: '自贡', code: 'zigong' },
      { name: '攀枝花', code: 'panzhihua' },
      { name: '泸州', code: 'luzhou' },
      { name: '德阳', code: 'deyang' },
      { name: '绵阳', code: 'mianyang' },
      { name: '广元', code: 'guangyuan' },
      { name: '遂宁', code: 'suining' },
      { name: '内江', code: 'neijiang' },
      { name: '乐山', code: 'leshan' },
      { name: '南充', code: 'nanchong' },
      { name: '眉山', code: 'meishan' },
      { name: '宜宾', code: 'yibin' },
      { name: '广安', code: 'guangan' },
      { name: '达州', code: 'dazhou' },
      { name: '雅安', code: 'yaan' },
      { name: '巴中', code: 'bazhong' },
      { name: '资阳', code: 'ziyang' },
      { name: '阿坝', code: 'aba' },
      { name: '甘孜', code: 'ganzi' },
      { name: '凉山', code: 'liangshan' }
    ]
  },
  {
    name: '贵州',
    code: 'guizhou',
    cities: [
      { name: '贵阳', code: 'guiyang' },
      { name: '六盘水', code: 'liupanshui' },
      { name: '遵义', code: 'zunyi' },
      { name: '安顺', code: 'anshun' },
      { name: '毕节', code: 'bijie' },
      { name: '铜仁', code: 'tongren' },
      { name: '黔西南', code: 'qianxinan' },
      { name: '黔东南', code: 'qiandongnan' },
      { name: '黔南', code: 'qiannan' }
    ]
  },
  {
    name: '云南',
    code: 'yunnan',
    cities: [
      { name: '昆明', code: 'kunming' },
      { name: '曲靖', code: 'qujing' },
      { name: '玉溪', code: 'yuxi' },
      { name: '保山', code: 'baoshan' },
      { name: '昭通', code: 'zhaotong' },
      { name: '丽江', code: 'lijiang' },
      { name: '普洱', code: 'puer' },
      { name: '临沧', code: 'lincang' },
      { name: '楚雄', code: 'chuxiong' },
      { name: '红河', code: 'honghe' },
      { name: '文山', code: 'wenshan' },
      { name: '西双版纳', code: 'xishuangbanna' },
      { name: '大理', code: 'dali' },
      { name: '德宏', code: 'dehong' },
      { name: '怒江', code: 'nujiang' },
      { name: '迪庆', code: 'diqing' }
    ]
  },
  {
    name: '西藏',
    code: 'tibet',
    cities: [
      { name: '拉萨', code: 'lhasa' },
      { name: '日喀则', code: 'rikaze' },
      { name: '昌都', code: 'changdu' },
      { name: '林芝', code: 'linzhi' },
      { name: '山南', code: 'shannan' },
      { name: '那曲', code: 'naqu' },
      { name: '阿里', code: 'ali' }
    ]
  },
  {
    name: '陕西',
    code: 'shaanxi',
    cities: [
      { name: '西安', code: 'xian' },
      { name: '铜川', code: 'tongchuan' },
      { name: '宝鸡', code: 'baoji' },
      { name: '咸阳', code: 'xianyang' },
      { name: '渭南', code: 'weinan' },
      { name: '延安', code: 'yanan' },
      { name: '汉中', code: 'hanzhong' },
      { name: '榆林', code: 'yulin-sx' },
      { name: '安康', code: 'ankang' },
      { name: '商洛', code: 'shangluo' }
    ]
  },
  {
    name: '甘肃',
    code: 'gansu',
    cities: [
      { name: '兰州', code: 'lanzhou' },
      { name: '嘉峪关', code: 'jiayuguan' },
      { name: '金昌', code: 'jinchang' },
      { name: '白银', code: 'baiyin' },
      { name: '天水', code: 'tianshui' },
      { name: '武威', code: 'wuwei' },
      { name: '张掖', code: 'zhangye' },
      { name: '平凉', code: 'pingliang' },
      { name: '酒泉', code: 'jiuquan' },
      { name: '庆阳', code: 'qingyang' },
      { name: '定西', code: 'dingxi' },
      { name: '陇南', code: 'longnan' },
      { name: '临夏', code: 'linxia' },
      { name: '甘南', code: 'gannan' }
    ]
  },
  {
    name: '青海',
    code: 'qinghai',
    cities: [
      { name: '西宁', code: 'xining' },
      { name: '海东', code: 'haidong' },
      { name: '海北', code: 'haibei' },
      { name: '黄南', code: 'huangnan' },
      { name: '海南', code: 'hainan-qh' },
      { name: '果洛', code: 'guoluo' },
      { name: '玉树', code: 'yushu' },
      { name: '海西', code: 'haixi' }
    ]
  },
  {
    name: '宁夏',
    code: 'ningxia',
    cities: [
      { name: '银川', code: 'yinchuan' },
      { name: '石嘴山', code: 'shizuishan' },
      { name: '吴忠', code: 'wuzhong' },
      { name: '固原', code: 'guyuan' },
      { name: '中卫', code: 'zhongwei' }
    ]
  },
  {
    name: '新疆',
    code: 'xinjiang',
    cities: [
      { name: '乌鲁木齐', code: 'urumqi' },
      { name: '克拉玛依', code: 'karamay' },
      { name: '吐鲁番', code: 'turpan' },
      { name: '哈密', code: 'hami' },
      { name: '昌吉', code: 'changji' },
      { name: '博尔塔拉', code: 'boertala' },
      { name: '巴音郭楞', code: 'bayinguoleng' },
      { name: '阿克苏', code: 'akesu' },
      { name: '克孜勒苏', code: 'kizilesu' },
      { name: '喀什', code: 'kashi' },
      { name: '和田', code: 'hetian' },
      { name: '伊犁', code: 'yili' },
      { name: '塔城', code: 'tacheng' },
      { name: '阿勒泰', code: 'aletai' }
    ]
  },
  {
    name: '内蒙古',
    code: 'neimenggu',
    cities: [
      { name: '呼和浩特', code: 'hohhot' },
      { name: '包头', code: 'baotou' },
      { name: '乌海', code: 'wuhai' },
      { name: '赤峰', code: 'chifeng' },
      { name: '通辽', code: 'tongliao' },
      { name: '鄂尔多斯', code: 'ordos' },
      { name: '呼伦贝尔', code: 'hulunbuir' },
      { name: '巴彦淖尔', code: 'bayannur' },
      { name: '乌兰察布', code: 'ulanqab' },
      { name: '兴安', code: 'xingan' },
      { name: '锡林郭勒', code: 'xilingol' },
      { name: '阿拉善', code: 'alxa' }
    ]
  },
  {
    name: '港澳台',
    code: 'hmt',
    cities: [
      { name: '香港', code: 'hongkong' },
      { name: '澳门', code: 'macao' },
      { name: '台北', code: 'taipei' },
      { name: '高雄', code: 'kaohsiung' },
      { name: '台中', code: 'taichung' },
      { name: '台南', code: 'tainan' },
      { name: '新北', code: 'xinbei' },
      { name: '桃园', code: 'taoyuan' }
    ]
  }
]

interface CitySelectorProps {
  value?: string
  onChange: (city: string) => void
  onClose: () => void
  isOpen: boolean
}

export default function CitySelector({ value, onChange, onClose, isOpen }: CitySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState<'domestic' | 'overseas'>('domestic')
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const modalRef = useRef<HTMLDivElement>(null)

  // 搜索城市
  useEffect(() => {
    if (searchTerm.trim()) {
      const allCities: City[] = []
      
      // 添加热门城市
      HOT_CITIES.forEach(city => {
        if (city.name.includes(searchTerm)) {
          allCities.push(city)
        }
      })
      
      // 添加省份城市
      PROVINCES_DATA.forEach(province => {
        province.cities.forEach(city => {
          if (city.name.includes(searchTerm) && !allCities.find(c => c.code === city.code)) {
            allCities.push({ ...city, province: province.name })
          }

          // 搜索区县（只有真正的嵌套区县才标记为isDistrict）
          if (city.districts) {
            city.districts.forEach(district => {
              if (district.name.includes(searchTerm)) {
                allCities.push({
                  name: district.name,
                  code: district.code,
                  province: province.name,
                  city: city.name,
                  isDistrict: true
                })
              }
            })
          }
        })
      })
      
      setFilteredCities(allCities)
    } else {
      setFilteredCities([])
    }
  }, [searchTerm])

  // 重置状态当选择器打开时
  useEffect(() => {
    if (isOpen) {
      setSelectedProvince('')
      setSelectedCity('')
      setSearchTerm('')
    }
  }, [isOpen])

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleCitySelect = (cityName: string, provinceName?: string) => {
    let displayName = cityName

    // 如果是"全XX"格式，显示省市名称
    if (cityName.startsWith('全')) {
      const baseName = cityName.substring(1)
      if (baseName === '北京' || baseName === '上海' || baseName === '天津' || baseName === '重庆') {
        displayName = `${baseName}市`
      } else if (baseName === '福州') {
        displayName = `福州市`
      } else {
        displayName = baseName
      }
    } else if (provinceName) {
      // 如果有省份名称，组合显示
      if (provinceName === '北京' || provinceName === '上海' || provinceName === '天津' || provinceName === '重庆') {
        displayName = `${provinceName}市${cityName}`
      } else {
        displayName = `${provinceName}${cityName}`
      }
    }

    onChange(displayName)
    onClose()
  }

  const handleDistrictSelect = (districtName: string, cityName: string, provinceName: string) => {
    let displayName = districtName

    // 如果是"全XX"格式，显示城市名称
    if (districtName.startsWith('全')) {
      const baseName = districtName.substring(1)
      displayName = `${baseName}市`
    } else {
      // 组合省市区显示
      displayName = `${provinceName}${cityName}${districtName}`
    }

    onChange(displayName)
    onClose()
  }

  const handleHotCitySelect = (cityName: string) => {
    let displayName = cityName

    // 直辖市显示为"XX市"格式，与省份选择保持一致
    if (cityName === '北京' || cityName === '上海' || cityName === '天津' || cityName === '重庆') {
      displayName = `${cityName}市`
    }

    onChange(displayName)
    onClose()
  }

  const handleSearchResultSelect = (city: City) => {
    let displayName = city.name

    if (city.isDistrict && city.province && city.city) {
      // 真正的区县搜索结果：显示完整的省市区格式
      if (city.name.startsWith('全')) {
        const baseName = city.name.substring(1)
        displayName = `${baseName}市`
      } else {
        // 组合省市区显示
        if (city.province === '北京' || city.province === '上海' || city.province === '天津' || city.province === '重庆') {
          displayName = `${city.province}市${city.name}`
        } else {
          displayName = `${city.province}${city.city}${city.name}`
        }
      }
    } else if (city.province) {
      // 城市搜索结果：使用与handleCitySelect相同的逻辑
      if (city.name.startsWith('全')) {
        const baseName = city.name.substring(1)
        if (baseName === '北京' || baseName === '上海' || baseName === '天津' || baseName === '重庆') {
          displayName = `${baseName}市`
        } else if (baseName === '福州') {
          displayName = `福州市`
        } else {
          displayName = baseName
        }
      } else {
        // 如果有省份名称，组合显示（与handleCitySelect保持一致）
        if (city.province === '北京' || city.province === '上海' || city.province === '天津' || city.province === '重庆') {
          displayName = `${city.province}市${city.name}`
        } else {
          displayName = `${city.province}${city.name}`
        }
      }
    } else {
      // 热门城市搜索结果：直辖市显示为"XX市"
      if (city.name === '北京' || city.name === '上海' || city.name === '天津' || city.name === '重庆') {
        displayName = `${city.name}市`
      }
    }

    onChange(displayName)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg w-full max-w-4xl h-[600px] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">请选择城市</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索框 */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索城市"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧导航 */}
          <div className="w-64 border-r bg-gray-50 overflow-y-auto">
            {/* 标签切换 */}
            <div className="flex border-b">
              <button
                onClick={() => setSelectedTab('domestic')}
                className={`flex-1 py-3 text-sm font-medium ${
                  selectedTab === 'domestic'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                国内
              </button>
              <button
                onClick={() => setSelectedTab('overseas')}
                className={`flex-1 py-3 text-sm font-medium ${
                  selectedTab === 'overseas'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                海外
              </button>
            </div>

            {selectedTab === 'domestic' && (
              <>
                {/* 历史/热门 */}
                <div className="p-3 border-b">
                  <button
                    onClick={() => {
                      setSelectedProvince('')
                      setSelectedCity('')
                    }}
                    className={`w-full text-left text-sm font-medium p-2 rounded hover:bg-blue-50 hover:text-blue-600 ${
                      !selectedProvince ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    }`}
                  >
                    历史/热门
                  </button>
                </div>

                {/* 省份列表 */}
                <div>
                  {PROVINCES_DATA.map((province) => (
                    <button
                      key={province.code}
                      onClick={() => {
                        setSelectedProvince(province.code)
                        setSelectedCity('') // 重置城市选择
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 ${
                        selectedProvince === province.code ? 'bg-gray-200 font-medium' : ''
                      }`}
                    >
                      {province.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {selectedTab === 'overseas' && (
              <div className="p-4 text-center text-gray-500">
                海外城市功能开发中...
              </div>
            )}
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 overflow-y-auto">
            {searchTerm.trim() ? (
              /* 搜索结果 */
              <div className="p-4">
                <div className="text-sm font-medium text-gray-700 mb-3">搜索结果</div>
                <div className="grid grid-cols-6 gap-2">
                  {filteredCities.map((city) => (
                    <button
                      key={city.code}
                      onClick={() => handleSearchResultSelect(city)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded hover:border-blue-500 hover:text-blue-600 text-center"
                    >
                      {city.name}
                      {city.province && (
                        <div className="text-xs text-gray-400">
                          {city.isDistrict && city.city ? `${city.province} ${city.city}` : city.province}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {filteredCities.length === 0 && (
                  <div className="text-center text-gray-500 py-8">未找到相关城市</div>
                )}
              </div>
            ) : selectedCity ? (
              /* 选中城市的区县 */
              <div className="p-4">
                {(() => {
                  const province = PROVINCES_DATA.find(p => p.code === selectedProvince)
                  const city = province?.cities.find(c => c.code === selectedCity)
                  if (!province || !city || !city.districts) return null

                  return (
                    <>
                      <div className="text-lg font-medium text-gray-900 mb-4">{province.name} / {city.name}</div>
                      <div className="grid grid-cols-6 gap-2">
                        {city.districts.map((district) => (
                          <button
                            key={district.code}
                            onClick={() => handleDistrictSelect(district.name, city.name, province.name)}
                            className={`px-3 py-2 text-sm border rounded text-center hover:border-blue-500 hover:text-blue-600 ${
                              district.name.startsWith('全')
                                ? 'border-orange-300 text-orange-600 bg-orange-50'
                                : 'border-gray-200'
                            }`}
                          >
                            {district.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )
                })()}
              </div>
            ) : selectedProvince ? (
              /* 选中省份的城市 */
              <div className="p-4">
                {(() => {
                  const province = PROVINCES_DATA.find(p => p.code === selectedProvince)
                  if (!province) return null

                  return (
                    <>
                      <div className="text-lg font-medium text-gray-900 mb-4">{province.name}</div>
                      <div className="grid grid-cols-6 gap-2">
                        {province.cities.map((city) => (
                          <button
                            key={city.code}
                            onClick={() => {
                              if (city.districts && city.districts.length > 0) {
                                setSelectedCity(city.code)
                              } else {
                                handleCitySelect(city.name, province.name)
                              }
                            }}
                            className={`px-3 py-2 text-sm border rounded text-center hover:border-blue-500 hover:text-blue-600 ${
                              city.name.startsWith('全')
                                ? 'border-orange-300 text-orange-600 bg-orange-50'
                                : 'border-gray-200'
                            }`}
                          >
                            {city.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )
                })()}
              </div>
            ) : (
              /* 热门城市 */
              <div className="p-4">
                <div className="text-lg font-medium text-gray-900 mb-4">热门城市</div>
                <div className="grid grid-cols-6 gap-2">
                  {HOT_CITIES.map((city) => (
                    <button
                      key={city.code}
                      onClick={() => handleHotCitySelect(city.name)}
                      className="px-3 py-2 text-sm border border-gray-200 rounded hover:border-blue-500 hover:text-blue-600 text-center"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
