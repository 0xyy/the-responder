const { writeFile, rm } = require('fs/promises')
const { faker } = require('@faker-js/faker')
const { makeQuestionRepository } = require('./question')

const testQuestions = [
  {
    id: faker.datatype.uuid(),
    summary: 'What is my name?',
    author: 'Jack London',
    answers: []
  },
  {
    id: faker.datatype.uuid(),
    summary: 'Who are you?',
    author: 'Tim Doods',
    answers: []
  }
]

describe('question repository', () => {
  const TEST_QUESTIONS_FILE_PATH = 'test-questions.json'
  let questionRepo

  beforeAll(async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]))

    questionRepo = makeQuestionRepository(TEST_QUESTIONS_FILE_PATH)
  })

  afterAll(async () => {
    await rm(TEST_QUESTIONS_FILE_PATH)
  })

  test('should return a list of 0 questions', async () => {
    expect(await questionRepo.getQuestions()).toHaveLength(0)
  })

  test('should return a list of 2 questions', async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getQuestions()).toHaveLength(2)
  })

  test('searching for not existing question should return null', async () => {
    const id = 'id of a nonexistent question';

    expect(await questionRepo.getQuestionById(id)).toBeNull()
  })

  test('should return one search question', async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    const id = testQuestions[0].id;

    expect((await questionRepo.getQuestionById(id)).id).toBe(id)
  })

  test('adding new question should return created question and should be included in the file', async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    const newQuestion = {
      author: 'Rick Astley',
      summary: 'What is 2 + 3',
    }

    expect(await questionRepo.addQuestion(newQuestion)).toBeDefined()
    expect(await questionRepo.getQuestions()).toHaveLength(3)
  })

  test('adding new answer should return created answer', async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    const questions = await questionRepo.getQuestions()
    const id = questions[0].id

    const newAnswer = {
      author: 'Spongebob',
      summary: 'I don\'t know',
    }

    expect(await questionRepo.addAnswer(id, newAnswer)).toBeDefined()
    expect(await questionRepo.getAnswers(id)).toBeDefined()
  })

  test('searching for not existing answers should return empty array', async () => {
    await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))

    expect(await questionRepo.getAnswers(testQuestions[0].id)).toHaveLength(0)
  })

  test('searching for not existing answer should return null', async () => {
    const questionId = testQuestions[0].id

    const answerId = 'id of a nonexistent answer';

    expect(await questionRepo.getAnswer(questionId, answerId)).toBeNull()
  })

  test('searching for not existing answer of not existing question should return null', async () => {
    const id = 'id of a nonexistent question and answer';

    expect(await questionRepo.getAnswer(id, id)).toBeNull()
  })
})
