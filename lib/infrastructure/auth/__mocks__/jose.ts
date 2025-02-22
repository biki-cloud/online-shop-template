export const SignJWT = jest.fn().mockImplementation(() => ({
  setProtectedHeader: jest.fn().mockReturnThis(),
  setIssuedAt: jest.fn().mockReturnThis(),
  setExpirationTime: jest.fn().mockReturnThis(),
  sign: jest.fn().mockResolvedValue("mock.jwt.token"),
}));

export const jwtVerify = jest.fn().mockResolvedValue({
  payload: {
    sub: "1",
    iat: 1234567890,
    exp: 1234567890,
  },
  protectedHeader: {
    alg: "HS256",
  },
});
