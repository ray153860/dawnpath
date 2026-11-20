import {describe,expect,it} from 'vitest'
import {activities,activityQuestions,scoreActivities,scoreSubjects,subjects} from './assessment'
import {bankMeta,subjectQuestions} from './questionBank'
describe('versioned exploratory bank',()=>{
 it('has one distinct prompt per discipline and two per activity',()=>{
  expect(bankMeta.validated).toBe(false)
  expect(subjects).toHaveLength(12)
  expect(subjectQuestions.map(q=>q.subject)).toEqual([...Array(12).keys()])
  expect(new Set(subjectQuestions.map(q=>q.id)).size).toBe(12)
  expect(activities).toHaveLength(6)
  expect(activityQuestions.map(q=>q.dimension).sort()).toEqual([0,0,1,1,2,2,3,3,4,4,5,5])
 })
})
describe('observational scoring',()=>{
 it('keeps unanswered, unknown and explicit disinterest distinct',()=>{
  const rows=scoreSubjects({subjectRatings:[null,-1,0,4,99,-5]})
  expect(rows[0].topicEvidence).toBe('未回答')
  expect(rows[1].topicEvidence).toBe('信息不足')
  expect(rows[2].topicEvidence).toBe('不感兴趣')
  expect(rows[2].topicRating).toBe(0)
  expect(rows[3].topicRating).toBe(4)
  expect(rows[4].topicRating).toBeNull()
  expect(rows[5].topicRating).toBeNull()
 })
 it('never turns missing experiences into zero or merges them with topics',()=>{
  const rows=scoreSubjects({subjectRatings:[4],experiences:[{subjectIndex:0,rating:null},{subjectIndex:0,rating:1},{subjectIndex:0,rating:3},{subjectIndex:7,rating:9}]})
  expect(rows[0]).toMatchObject({topicRating:4,experienceRating:2,experienceCount:2})
  expect(rows[1].experienceRating).toBeNull()
  expect(rows[7].experienceCount).toBe(0)
 })
 it('keeps activity dimensions separate and rejects bad input',()=>{
  expect(scoreActivities([0,4,-1,null,4,4])[0]).toMatchObject({mean:2,answered:2})
  expect(scoreActivities([0,4,-1,null,4,4])[1]).toMatchObject({mean:null,answered:0})
  expect(scoreActivities('bad').every(x=>x.mean===null)).toBe(true)
 })
})
