import { readFileSync, writeFileSync } from "node:fs";

const f = "src/lib/data/takeaway-shops.ts";
let s = readFileSync(f, "utf8");

const intros = {
  "kikunoi-akasaka": "京都「菊乃井」第三代主厨村田吉弘于 1958 年继承家业，主张「味道即记忆」。赤坂本店连续多年蝉联米其林二星，以四季为骨、以茶汤为魂，延续茶怀石「一汁三菜」规制。出汁只取利尻昆布与四年熟成本枯節，一日一炊。",
  "sukiyabashi-jiro-ginza": "银座地下的小小寿司台只有 10 个座位，却蝉联米其林三星逾十年。主人小野二郎生于 1925 年，至今仍每日立于台前。江户前寿司讲究「从淡入浓」的贯序，米温与人体同温，称为「シャリ」。",
  "xia-gong-beijing": "夏宫坐落北京中国大饭店，1990 年开业，是改革开放后京城最早的商务宴请粤菜餐厅之一。如今由袁超英师傅坐镇，传承 155 年明火挂炉烤鸭技艺，融合粤菜与淮扬菜。",
  "guy-savoy-paris": "Guy Savoy 康提堤岸本店连续多年被《La Liste》评为全球最佳，米其林三星。主厨相信「味道是记忆」，招牌大理石纹鸡胸鹅肝洋蓟源自童年家常菜，被升华为法餐艺术巅峰。",
  "fuhe-huaishan-zhai": "福和慧藏于上海愚园路，高端素食代表，主张「以素写荤」——杏鲍菇模拟鲍鱼、豆乳模拟奶香。米其林一星，菜单随二十四节气流转。",
  "l-ambroisie-paris": "L'Ambroisie 隐于巴黎最古老的孚日广场回廊，自 1988 年起连续三十余年蝉联米其林三星，以近乎顽固的古典法餐闻名。鱼子酱溏心蛋与热巧克力舒芙蕾是镇店之宝。",
  "da-vittorio-brusaporto": "Da Vittorio 位于意大利北部 Brusaporto，Cerea 家族四代经营，米其林三星逾半个世纪。每年 10–12 月白松露季，阿尔巴白松露按克现刨。",
  "ukai-teppanyaki-ginza": "うかい亭银座本店临海景铁板烧台，主厨在 280°C 铁板前完成刀工与火候的现场表演。坚持 A5 等级近江牛（滋贺县产，霜降 BMS 11）。",
  "the-macallan-lounge": "Macallan 被誉为「单一麦芽威士忌的劳斯莱斯」，坚持 100% 雪莉橡木桶熟成。Estate Lounge 提供从 12 年到 40 年的垂直品鉴，配手工水晶闻香杯与主理人手写风味轮。",
};

let n = 0;
for (const [slug, text] of Object.entries(intros)) {
  const anchor = `...shopMedia("${slug}", 1),`;
  const blockRe = new RegExp(`slug: "${slug}"[\\s\\S]*?\\n  \\},`);
  const block = s.match(blockRe)?.[0] ?? "";
  if (block.includes("intro:")) continue;
  if (block.includes(anchor)) {
    s = s.replace(anchor, `intro: "${text}",\n    ${anchor}`);
    n++;
  }
}
writeFileSync(f, s);
console.log("inserted", n);
