export const success = (res, data, code = 200) => {
  res.status(code).json({
    success: true,
    data: Array.isArray(data) ? data : data,
    message: "Success",
  });
};

export const error = (res, message, code = 500, details = null) => {
  const body = {
    success: false,
    error: message,
  };
  if (details !== null) {
    body.details = details;
  }
  res.status(code).json(body);
};
