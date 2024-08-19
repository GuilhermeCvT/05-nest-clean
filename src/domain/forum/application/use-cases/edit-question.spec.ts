import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { makeQuestion } from 'test/factories/make-question'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { EditQuestionUseCase } from './edit-question'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repositories'
import { makeQuestionAttachment } from 'test/factories/make-question-attachment'

let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let sut: EditQuestionUseCase

describe('Edit Answer', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository = new InMemoryQuestionAttachmentsRepository()
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(inMemoryQuestionAttachmentsRepository)
    sut = new EditQuestionUseCase(inMemoryQuestionsRepository, inMemoryQuestionAttachmentsRepository)
  })

  it('should be able to edit a answer', async () => {
    const question = makeQuestion({authorId: new UniqueEntityID('author-1')}, new UniqueEntityID('answer-1'))
    await inMemoryQuestionsRepository.create(question)

    inMemoryQuestionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        questionId: question.id,
        attachmentId: new UniqueEntityID('1')
      }),
      makeQuestionAttachment({
        questionId: question.id,
        attachmentId: new UniqueEntityID('2')
      })
    )

    await sut.execute({
      authorId: 'author-1',
      title: 'Pergunta teste',
      content: 'Conteúdo teste',
      questionId: question.id.toValue(),
      attachmentsIds: ['1', '3']
    })

    expect(inMemoryQuestionsRepository.items[0]).toMatchObject({
      title: 'Pergunta teste',
      content: 'Conteúdo teste',
    })
    expect(inMemoryQuestionsRepository.items[0].attachments.currentItems).toHaveLength(2)
    expect(inMemoryQuestionsRepository.items[0].attachments.currentItems).toEqual([
      expect.objectContaining({attachmentId: new UniqueEntityID('1')}),
      expect.objectContaining({attachmentId: new UniqueEntityID('3')})
    ])
  })

  it('should not be able to edit a answer from another user', async () => {
    const question = makeQuestion({authorId: new UniqueEntityID('author-1')}, new UniqueEntityID('answer-1'))
    await inMemoryQuestionsRepository.create(question)

    const result = await sut.execute({
      authorId: 'author-2',
      title: 'Pergunta teste',
      content: 'Conteúdo teste',
      questionId: question.id.toValue(),
      attachmentsIds: []
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should sync new and removed attachments when editing a question', async () => {
    const question = makeQuestion({authorId: new UniqueEntityID('author-1')}, new UniqueEntityID('answer-1'))
    await inMemoryQuestionsRepository.create(question)

    inMemoryQuestionAttachmentsRepository.items.push(
      makeQuestionAttachment({
        questionId: question.id,
        attachmentId: new UniqueEntityID('1')
      }),
      makeQuestionAttachment({
        questionId: question.id,
        attachmentId: new UniqueEntityID('2')
      })
    )

    const result = await sut.execute({
      authorId: 'author-1',
      title: 'Pergunta teste',
      content: 'Conteúdo teste',
      questionId: question.id.toValue(),
      attachmentsIds: ['1', '3']
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryQuestionAttachmentsRepository.items).toHaveLength(2)
    expect(inMemoryQuestionAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({attachmentId: new UniqueEntityID('1')}),
        expect.objectContaining({attachmentId: new UniqueEntityID('3')}),
      ])
    )
  })
})
