export function getPagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1)
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100)

  return { page, limit, offset: (page - 1) * limit }
}

export function paginationResult(rows, count, page, limit) {
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  }
}
