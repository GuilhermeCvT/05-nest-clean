import { Slug } from './slug'

test('it should be able to create a new slug from text', () => {
  const slug = Slug.createFromText('An Example Test')

  expect(slug.value).toEqual('an-example-test')
})
