import { updateOne } from './zeev-db.mjs'

export function updateForm ({ pool, codform, html }) {
  const query = `update wfForm set DsLayout = '${html}' where CodForm = ${codform}`

  return updateOne({
    pool,
    key: codform,
    query
  })
}

export function updateFormHeader ({ pool, codform, html }) {
  const query = `update wfForm set DsLayoutHead = '${html}' where CodForm = ${codform}`

  return updateOne({
    pool,
    key: codform,
    query
  })
}

export function updateReportHeader ({ pool, codform, html }) {
  const query = `update wfForm set DsLayoutHeadReport = '${html}' where CodForm = ${codform}`

  return updateOne({
    pool,
    key: codform,
    query
  })
}
