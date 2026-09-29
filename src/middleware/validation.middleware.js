export function validateBody(schema) {
  return (request, _response, next) => {
    const { error, value } = schema.validate(request.body, { abortEarly: false, stripUnknown: true })

    if (error) {
      error.statusCode = 422
      error.code = 'VALIDATION_ERROR'
      return next(error)
    }

    request.body = value
    return next()
  }
}
