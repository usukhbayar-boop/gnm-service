module.exports = {
  apps: [
    {
      name: "gnm-serv",
      script: "src/server.js", // Replace with your actual entry point file
      env: {
        PORT: 5500,
        QPAY_BASE_URL: "https://merchant.qpay.mn/v2",
        // Split the database connection string into parts
        DB_USER: "dnm-db_owner",
        DB_PASSWORD: "zfvqIsi2WMO1",
        DB_HOST: "ep-young-frost-a1shbvl9.ap-southeast-1.aws.neon.tech",
        DB_NAME: "dnm-db",
        DB_SSL: "require",
        // Your other environment variables
        QPAY_USERNAME: "GOOD_NEIGHBORS",
        QPAY_PASSWORD: "eSkFT03t",
        GOOGLE_CLIENT_ID:
          "974098185999-6pn6tq2a0fk3a4qcuglmhe79mirn8g4f.apps.googleusercontent.com",
        GOOGLE_CLIENT_SECRET: "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",
        JWT_SECRET:
          "436bff0474795cf660fa4d4a3265d7a718829ad4dc59e1227ad8fe2afb45bd3596cb7dc4482b44ff7e3bab16d0df79876d255b9464d0c061efb318128d0c5e61e00ce91c19dd6175530eb8f110998457ab2a1b67078f8365b41536f97446c4366eb1356c3499bf6e38a0134d09f32086f74bda225a2be2aee8a2b0719c03f3ac76ec1846539486168736ae56c7a409e382456f5a57d5199136236067ff5fc421c56d20546ed152e058cbfbb2a7f582391d600e30e8042db3177eaf08b7347fc33f8d980e28b3c7e663f4b2f5c37dcd308a45d2e579f10095cbb67a5702461a82878bd6b08f13f4734b0b8f8f170a58abedff5f086011cda42239bcb8e540f35e",
        SESSION_SECRET: "f?5h<u-V3N=c8!I$`J33+CopDZe<-L",
        NODE_ENV: "production",
      },
    },
  ],
};
