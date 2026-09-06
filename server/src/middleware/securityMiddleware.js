import { verifySessionToken } from "../services/authService.js";

const bearerToken = (request) => {
  const header = request.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
};

const forbidden = (message = "Não tens permissões para esta operação.") => {
  const error = new Error(message);
  error.status = 403;
  return error;
};

export const optionalAuth = (request, response, next) => {
  const token = bearerToken(request);

  if (!token) {
    next();
    return;
  }

  try {
    request.auth = verifySessionToken(token);
  } catch (error) {
    request.auth = null;
  }

  next();
};

export const requireAuth = (request, response, next) => {
  const token = bearerToken(request);

  if (!token) {
    const error = new Error("Inicia sessão para continuar.");
    error.status = 401;
    next(error);
    return;
  }

  try {
    request.auth = verifySessionToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles) => (request, response, next) => {
  if (!request.auth || !roles.includes(request.auth.role)) {
    next(forbidden());
    return;
  }

  next();
};

export const requireSelfOrAdmin = (paramName = "userId") => (request, response, next) => {
  if (request.auth?.role === "admin") {
    next();
    return;
  }

  if (Number(request.params[paramName]) !== Number(request.auth?.userId)) {
    next(forbidden("Só podes aceder aos dados da tua própria conta."));
    return;
  }

  next();
};