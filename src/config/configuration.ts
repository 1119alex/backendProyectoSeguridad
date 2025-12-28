export default () => ({
  // Aplicación
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
  },

  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'inventory_system',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '100', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '10000', 10),
    ssl: process.env.DB_SSL_CA
      ? {
          ca: process.env.DB_SSL_CA,
          cert: process.env.DB_SSL_CERT,
          key: process.env.DB_SSL_KEY,
        }
      : undefined,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_key',
    expiresIn: process.env.JWT_EXPIRATION || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  // Bcrypt
  bcrypt: {
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  },

  // MFA
  mfa: {
    appName: process.env.MFA_APP_NAME || 'Inventory System',
    issuer: process.env.MFA_ISSUER || 'YourCompany',
  },

  // Rate Limiting
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    loginTtl: parseInt(process.env.THROTTLE_LOGIN_TTL || '900000', 10),
    loginLimit: parseInt(process.env.THROTTLE_LOGIN_LIMIT || '5', 10),
  },

  // CORS
  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Swagger
  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
    title: process.env.SWAGGER_TITLE || 'API Documentation',
    description: process.env.SWAGGER_DESCRIPTION || '',
    version: process.env.SWAGGER_VERSION || '1.0',
    path: process.env.SWAGGER_PATH || 'docs',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs',
    maxFiles: process.env.LOG_MAX_FILES || '10',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
  },

  // Auditoría
  audit: {
    enabled: process.env.AUDIT_ENABLED === 'true',
    logRequests: process.env.AUDIT_LOG_REQUESTS === 'true',
    logResponses: process.env.AUDIT_LOG_RESPONSES === 'true',
  },

  // Seguridad de sesiones
  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    accountLockTime: parseInt(process.env.ACCOUNT_LOCK_TIME || '15', 10),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '30', 10),
  },

  // Políticas de contraseñas
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '12', 10),
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === 'true',
    expirationDays: parseInt(process.env.PASSWORD_EXPIRATION_DAYS || '90', 10),
    historyCount: parseInt(process.env.PASSWORD_HISTORY_COUNT || '6', 10),
  },

  // Feature Flags
  features: {
    mfaRequired: process.env.FEATURE_MFA_REQUIRED === 'true',
    passwordResetEnabled:
      process.env.FEATURE_PASSWORD_RESET_ENABLED === 'true',
    emailVerification: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
  },
});
