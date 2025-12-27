const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-2_VHu17zKq5',
      userPoolClientId: '4ppeajkkrig5t1bq9ahbhb5pvj',
      region: 'us-east-2',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true
      }
    }
  }
};

export default awsConfig;