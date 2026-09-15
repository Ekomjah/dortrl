import type { SelectClick, SelectLink } from '../../db/schema.js'

export interface statsClicks extends SelectLink {
  clicks: SelectClick[]
}
