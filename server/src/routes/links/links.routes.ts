import { Hono } from 'hono'
import { ReasonPhrases, StatusCodes } from 'shared'
import { linkValidators } from './links.schema.js'
import { linksRepository } from './links.service.js'

const linksRoute = new Hono()
  .get('/', async (c) => {
    const allLinks = await linksRepository.getAllLinks()
    return c.json(allLinks)
  })
  .post('/', ...linkValidators.create(), async (c) => {
    const itemsToSave = c.req.valid('json')
    const inserted = await linksRepository.createNewLink(itemsToSave)
    return c.json(inserted, StatusCodes.CREATED)
  })
  .patch('/:code', ...linkValidators.update(), async (c) => {
    const { code } = c.req.valid('param')
    const itemsToUpdate = c.req.valid('json')
    const updated = await linksRepository.updateLink(code, itemsToUpdate)
    if (!updated) {
      return c.json({ message: ReasonPhrases.NOT_FOUND }, StatusCodes.NOT_FOUND)
    }
    return c.json(updated)
  })
  .delete('/:code', ...linkValidators.getById(), async (c) => {
    const { code } = c.req.valid('param')
    const deleted = await linksRepository.deleteLink(code)
    if (!deleted) {
      return c.json({ message: ReasonPhrases.NOT_FOUND }, StatusCodes.NOT_FOUND)
    }

    return c.body(null, StatusCodes.NO_CONTENT)
  })

export default linksRoute
