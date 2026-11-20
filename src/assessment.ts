import { activities, activityQuestions, subjects } from './questionBank'
export { activities, activityQuestions, subjects } from './questionBank'

export type Evidence = '未回答' | '信息不足' | '不感兴趣' | '有兴趣线索'
export type SubjectResult = {subject:string; topicRating:number|null; topicEvidence:Evidence; experienceRating:number|null; experienceCount:number}

// Reports observations only: no composite score or discipline-match percentage.
export function scoreSubjects(input:{subjectRatings:unknown; experiences?:Array<{subjectIndex:number;rating:number|null}>}):SubjectResult[]{
 const ratings=Array.isArray(input.subjectRatings)?input.subjectRatings:[]
 const experiences=Array.isArray(input.experiences)?input.experiences:[]
 return subjects.map((subject,index)=>{
  const raw=ratings[index]
  const topicRating=Number.isInteger(raw)&&raw>=0&&raw<=4?raw:null
  const topicEvidence:Evidence=raw===-1?'信息不足':topicRating===null?'未回答':topicRating===0?'不感兴趣':'有兴趣线索'
  const valid=experiences.filter(x=>x.subjectIndex===index&&Number.isInteger(x.rating)&&x.rating!==null&&x.rating>=0&&x.rating<=4)
  const experienceRating=valid.length?valid.reduce((sum,x)=>sum+(x.rating??0),0)/valid.length:null
  return {subject,topicRating,topicEvidence,experienceRating,experienceCount:valid.length}
 })
}

export function scoreActivities(input:unknown):Array<{name:string;mean:number|null;answered:number}>{
 const ratings=Array.isArray(input)?input:[]
 return activities.map((name,dimension)=>{
  const values=activityQuestions.flatMap((item,index)=>item.dimension===dimension&&Number.isInteger(ratings[index])&&ratings[index]>=0&&ratings[index]<=4?[ratings[index] as number]:[])
  return {name,mean:values.length?values.reduce((a,b)=>a+b,0)/values.length:null,answered:values.length}
 })
}
