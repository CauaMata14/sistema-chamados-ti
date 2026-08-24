/**
 * Erro de aplicação com status HTTP e mensagem segura para o usuário final.
 * Qualquer erro que não seja uma AppError é tratado pelo middleware central
 * como falha interna genérica, sem vazar detalhes ao cliente.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static naoEncontrado(recurso = 'Recurso'): AppError {
    return new AppError(`${recurso} não encontrado.`, 404);
  }

  static naoAutorizado(mensagem = 'Não autorizado.'): AppError {
    return new AppError(mensagem, 401);
  }

  static proibido(mensagem = 'Você não tem permissão para executar esta ação.'): AppError {
    return new AppError(mensagem, 403);
  }

  static conflito(mensagem: string): AppError {
    return new AppError(mensagem, 409);
  }
}
