import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Lifeline',
  webDir: 'dist',
  server: {
    // 앱 자체를 HTTP로 실행하도록 설정 (Mixed Content 에러 회피)
    androidScheme: 'http', 
    cleartext: true,
    allowNavigation: ['192.168.35.145', '10.120.54.116', '10.0.2.2', '10.0.20.167', '10.0.30.120', 'localhost']
  }
};

export default config;
