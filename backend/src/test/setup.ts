process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??=
  "postgresql://casa:casa@localhost:5432/casa_test";
process.env.REDIS_URL ??= "redis://localhost:6379";
process.env.ADMIN_API_KEY ??= "test-admin-key";
process.env.WHATSAPP_VERIFY_TOKEN ??= "casa_verify_token";
process.env.UNLOCK_FEE_CDF ??= "5000";
process.env.PAYMENTS_ENABLED ??= "false";
process.env.DEFAULT_SEARCH_RADIUS_KM ??= "5";
