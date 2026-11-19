export const subjects = ['哲学','经济','法律与社会','教育与心理','语言文学','历史文化','数学与自然科学','工程技术','农业生态','生命健康','商业管理','艺术设计'] as const
export const activities = ['分析推理','设计解决','实验验证','创作表达','交流帮助','组织决策'] as const
export const subjectActions = ['追问背后的价值与假设','比较资源分配与代价','检视规则、权利和群体影响','观察人如何学习与改变','用语言讲清楚或创作表达','寻找时间线与史料线索','用数字和自然规律解释','设计可运行的工具或系统','关注土地、作物与生态','理解身体健康与照护','组织人员、预算与流程','用视觉或形式呈现想法'] as const

export type SceneQuestion = { prompt: string; choices: [number, number, number, number] }
const prompts = [
  '社区准备改造一处闲置空间，你最想先做什么？','学校想减少午餐浪费，你会从哪里开始？','一条河附近出现鱼类减少的情况，你想先了解什么？','老街准备开设小型展览，你愿意承担哪项工作？',
  '校园里出现了关于手机使用的新规则，你最想做什么？','一种新材料可能用于建造轻便桥梁，你会关注什么？','同学们很难记住一组新概念，你想尝试什么？','本地农田在连续高温后收成下降，你会调查什么？',
  '一个公益社团经费有限，如何安排下一次活动？','城市里某些路口常发生拥堵，你想如何理解它？','一段家族口述记忆与档案记录有出入，你会怎么做？','健康中心希望让青少年更愿意求助，你会提出什么？',
  '一项公共服务需要同时照顾不同人群，你先考虑什么？','夜空观测中发现某颗星亮度变化，你会怎么记录？','小型团队要在一周内完成作品，你愿意负责什么？','博物馆想改善观众体验，你会怎样收集意见？',
  '一款面向学生的预算工具要开始设计，你会关注什么？','植物叶片出现不同斑点，你会如何寻找原因？','校内辩论中双方引用了相互矛盾的数据，你会怎么核实？','为陌生访客设计一份城市漫步路线，你会怎么做？',
  '一次实验结果和预期不一样，你下一步会做什么？','社区需要决定是否增加夜间照明，你会如何参与？','一段古代文本有多种解释，你会从哪里入手？','你想让一件日常物品更易于使用，会怎样开始？'
]
const optionSets: [number,number,number,number][] = Array.from({length:24},(_,i)=>{
  const base=(i*5)%12
  return [base,(base+3)%12,(base+6)%12,(base+9)%12]
})
export const sceneQuestions: SceneQuestion[] = prompts.map((prompt,i)=>({prompt,choices:optionSets[i]}))

export const activityQuestions = [
  {dimension:0,text:'面对复杂问题，我喜欢把信息拆开并找出规律。'},{dimension:0,text:'我愿意比较证据，推断哪些解释更合理。'},
  {dimension:1,text:'我喜欢设计或改造东西，让它更好用。'},{dimension:1,text:'遇到现实问题时，我常会先想出可尝试的方案。'},
  {dimension:2,text:'我愿意通过实验、观察或记录来检验猜想。'},{dimension:2,text:'结果和预期不同时，我仍想继续查找原因。'},
  {dimension:3,text:'我喜欢用文字、图像、声音或动作表达想法。'},{dimension:3,text:'我会享受把零散灵感组织成作品的过程。'},
  {dimension:4,text:'我愿意倾听他人，并帮助他们梳理需要。'},{dimension:4,text:'我喜欢分享知识，观察别人是否理解。'},
  {dimension:5,text:'我愿意安排步骤、协调资源并推动事情完成。'},{dimension:5,text:'遇到分歧时，我愿意帮助团队形成可执行的决定。'}
] as const

export type ScoreInput = { sceneAnswers: Array<number | null>; secondaryAnswers?: Array<number | null>; subjectRatings: Array<number | null>; experienceRatings?: Array<number | null>; completedThemes?: number }
export type ScoreRow = { subject: string; score: number | null; sceneEvidence: number; topicEvidence: number; experienceEvidence: number; status: '有线索'|'信息不足'|'尚未体验' }
const mean=(values:number[])=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null
export function scoreSubjects(input:ScoreInput):ScoreRow[]{
 const sceneCounts=subjects.map((_,index)=>input.sceneAnswers.reduce<number>((sum,a,q)=>{
  const choices=sceneQuestions[q]?.choices
  if(!choices?.includes(index))return sum
  return sum+(a===-4?1:a===index?1:input.secondaryAnswers?.[q]===index?0.5:0)
 },0))
 const exposures=subjects.map((_,index)=>sceneQuestions.reduce((sum,q,qi)=>sum+(q.choices.includes(index)&&input.sceneAnswers[qi]!==undefined&&input.sceneAnswers[qi]!==null&&input.sceneAnswers[qi]!==-2&&input.sceneAnswers[qi]!==-3?1:0),0))
 const isExperienced=(input.completedThemes??0)>=2
 return subjects.map((subject,index)=>{
  const scene=exposures[index]?sceneCounts[index]/exposures[index]:null
  const topicValues=(input.subjectRatings[index]===null||input.subjectRatings[index]===undefined||input.subjectRatings[index]<0)?[]:[input.subjectRatings[index]]
  const topic=mean(topicValues.map(v=>v/4))
  const expRaw=input.experienceRatings?.[index]
  const experience=expRaw===null||expRaw===undefined||expRaw<0?null:expRaw/4
  const parts=isExperienced?[[scene,.20],[topic,.25],[experience,.55]] as const:[[scene,.35],[topic,.65]] as const
  const available=parts.filter((part)=>part[0]!==null) as Array<readonly [number,number]>
  const weighted=available.length?available.reduce((s,[value,weight])=>s+value*weight,0)/available.reduce((s,[,weight])=>s+weight,0):null
  return {subject,score:weighted===null?null:Math.round(weighted*100),sceneEvidence:sceneCounts[index],topicEvidence:topic===null?0:1,experienceEvidence:experience===null?0:1,status:weighted===null?'信息不足':isExperienced&&experience===null?'尚未体验':'有线索'}
 })
}
