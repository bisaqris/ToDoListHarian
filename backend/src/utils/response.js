export const success = (res, data, code = 200) => {
  res.status(code).json({ 
    success: true, 
    data: Array.isArray(data) ? data : data,
    message: "Success"
  });
};
