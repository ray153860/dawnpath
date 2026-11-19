import { describe, expect, it } from 'vitest'
import { activities, activityQuestions, sceneQuestions, scoreSubjects } from './assessment'

describe('assessment bank',()=>{
 it('contains 24 balanced scenes with four different subjects each',()=>{
  expect(sceneQuestions).toHaveLength(24)
  const counts=Array(12).fill(0)
  for(const q of sceneQuestions){expect(new Set(q.choices).size).toBe(4);q.choices.forEach(i=>counts[i]++)}
  expect(Math.max(...counts)-Math.min(...counts)).toBeLessThanOrEqual(1)
 })
 it('contains two independent items for each activity dimension',()=>{
  expect(activities).toHaveLength(6);expect(activityQuestions).toHaveLength(12)
  expect(activityQuestions.map(x=>x.dimension).sort()).toEqual([0,0,1,1,2,2,3,3,4,4,5,5])
 })
})

describe('scoreSubjects',()=>{
 it('does not turn missing or unknown ratings into zero',()=>{
  const rows=scoreSubjects({sceneAnswers:[null,-2,-3],subjectRatings:Array(12).fill(null)})
  expect(rows.every(row=>row.score===null)).toBe(true)
 })
 it('normalizes available weights when one source is missing',()=>{
  const ratings=Array(12).fill(null);ratings[0]=4
  const rows=scoreSubjects({sceneAnswers:[],subjectRatings:ratings})
  expect(rows[0].score).toBe(100)
 })
 it('uses experience only after at least two themes are completed',()=>{
  const ratings=Array(12).fill(0);ratings[0]=4
  const experience=Array(12).fill(0);experience[0]=0
  const early=scoreSubjects({sceneAnswers:[0],subjectRatings:ratings,experienceRatings:experience,completedThemes:1})
  const later=scoreSubjects({sceneAnswers:[0],subjectRatings:ratings,experienceRatings:experience,completedThemes:2})
  expect(early[0].score).toBe(100);expect(later[0].score).toBe(45)
 })
 it('counts primary, secondary and all-interest without hiding explicit disinterest',()=>{
  const topic=Array(12).fill(null)
  const first=sceneQuestions[0].choices
  const one=scoreSubjects({sceneAnswers:[first[0]],secondaryAnswers:[first[1]],subjectRatings:topic})
  expect(one[first[0]].score).toBe(100)
  expect(one[first[1]].score).toBe(50)
  const all=scoreSubjects({sceneAnswers:[-4],subjectRatings:topic})
  expect(first.every(i=>all[i].score===100)).toBe(true)
  const none=scoreSubjects({sceneAnswers:[-1],subjectRatings:topic})
  expect(first.every(i=>none[i].score===0)).toBe(true)
 })
})
