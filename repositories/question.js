const { readFile, writeFile } = require('fs/promises')
const { v4: uuid } = require('uuid')

const makeQuestionRepository = fileName => {
  const getQuestions = async () => {
    const fileContent = await readFile(fileName, { encoding: 'utf-8' })
    const questions = JSON.parse(fileContent)

    return questions
  }

  const getQuestionById = async questionId => {
    const question = (await getQuestions()).find(question => question.id === questionId)

    return question ?? null
  }

  const addQuestion = async question => {
    if (!['author', 'summary'].every(word => Object.keys(question).includes(word))) {
      return;
    }

    const questions = await getQuestions();

    const newQuestion = {
      id: uuid(),
      ...question,
      answers: [],
    }

    questions.push(newQuestion)

    await writeFile(fileName, JSON.stringify(questions))

    return newQuestion
  }

  const getAnswers = async questionId => {
    const question = await getQuestionById(questionId);

    return question ? question.answers : null
  }

  const getAnswer = async (questionId, answerId) => {
    const answers = await getAnswers(questionId)

    if (!answers) return null

    const answer = answers.find(answer => answer.id === answerId)

    return answer ?? null
  }

  const addAnswer = async (questionId, answer) => {
    if (!['author', 'summary'].every(word => Object.keys(answer).includes(word))) {
      return
    }

    const questions = await getQuestions();

    const newAnswer = {
      id: uuid(),
      ...answer,
    }

    const question = questions.find(question => question.id === questionId)

    if (!question) {
      return
    }

    question.answers.push(newAnswer)

    await writeFile(fileName, JSON.stringify(questions))

    return newAnswer
  }

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswer,
    addAnswer
  }
}

module.exports = { makeQuestionRepository }
